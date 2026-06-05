import SQLite from 'react-native-sqlite-storage';
import * as Keychain from 'react-native-keychain';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';

SQLite.enablePromise(true);

const DB_NAME = 'FieldGuard.db';
const KEYCHAIN_SERVICE = 'com.fieldguard.ai.dbkey';
const HMAC_KEYCHAIN_SERVICE = 'com.fieldguard.ai.hmackey';

const float32ToBase64 = (f32Array: Float32Array): string => {
  const uint8Array = new Uint8Array(f32Array.buffer);
  const words = [];
  for (let i = 0; i < uint8Array.length; i += 4) {
    words.push(
      (uint8Array[i] << 24) |
      (uint8Array[i + 1] << 16) |
      (uint8Array[i + 2] << 8) |
      (uint8Array[i + 3])
    );
  }
  const wordArr = CryptoJS.lib.WordArray.create(words, uint8Array.length);
  return CryptoJS.enc.Base64.stringify(wordArr);
};

const base64ToFloat32 = (base64Str: string): Float32Array => {
  const wordArr = CryptoJS.enc.Base64.parse(base64Str);
  const uint8Array = new Uint8Array(wordArr.sigBytes);
  for (let i = 0; i < wordArr.sigBytes; i++) {
    uint8Array[i] = (wordArr.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return new Float32Array(uint8Array.buffer);
};

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  private async getEncryptionKey(): Promise<string> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
      if (credentials) {
        return credentials.password;
      }
      
      // Generate a new 256-bit key if not exists
      const newKey = CryptoJS.lib.WordArray.random(32).toString();
      await Keychain.setGenericPassword('dbUser', newKey, { service: KEYCHAIN_SERVICE });
      return newKey;
    } catch (error) {
      console.error('Keychain access error', error);
      throw error;
    }
  }

  public async initDatabase(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      try {
        const key = await this.getEncryptionKey();
        
        // Open encrypted database using SQLCipher
        this.db = await SQLite.openDatabase({
          name: DB_NAME,
          location: 'default',
          key: key, // This requires react-native-sqlcipher-storage
        });

        await this.createTables();
      } catch (error) {
        console.error('Database initialization failed', error);
        this.initPromise = null;
        throw error;
      }
    })();
    return this.initPromise;
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const queries = [
      `CREATE TABLE IF NOT EXISTS workers (
        worker_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT,
        phone TEXT,
        face_embedding BLOB NOT NULL,
        enrolled_by TEXT,
        enrollment_date INTEGER,
        is_active INTEGER DEFAULT 1
      );`,
      `CREATE TABLE IF NOT EXISTS attendance_logs (
        log_id TEXT PRIMARY KEY,
        worker_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        gps_lat REAL,
        gps_lng REAL,
        confidence_score REAL,
        challenge_type TEXT,
        hmac_signature TEXT NOT NULL,
        sync_status TEXT DEFAULT 'PENDING',
        synced_at INTEGER,
        device_id TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS sync_queue (
        queue_id TEXT PRIMARY KEY,
        log_id TEXT NOT NULL,
        created_at INTEGER,
        retry_count INTEGER DEFAULT 0,
        last_error TEXT
      );`
    ];

    for (const query of queries) {
      await this.db.executeSql(query);
    }
  }

  // --- Worker Operations ---

  public async enrollWorker(
    name: string,
    department: string,
    phone: string,
    faceEmbedding: Float32Array,
    enrolledBy: string
  ): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');
    
    const workerId = uuidv4();
    const timestamp = Date.now();
    
    // Serialize Float32Array to Base64 for BLOB storage
    // SQLite in React Native handles BLOBs efficiently via base64 strings.
    const embeddingStr = float32ToBase64(faceEmbedding);

    const query = `INSERT INTO workers (worker_id, name, department, phone, face_embedding, enrolled_by, enrollment_date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    await this.db.executeSql(query, [workerId, name, department, phone, embeddingStr, enrolledBy, timestamp]);
    
    return workerId;
  }

  public async getAllWorkers(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const [results] = await this.db.executeSql(`SELECT * FROM workers WHERE is_active = 1`);
    const workers = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      // Parse embedding back to Float32Array
      row.face_embedding = base64ToFloat32(row.face_embedding);
      workers.push(row);
    }
    return workers;
  }

  // --- Attendance Operations ---

  private async getHmacKey(): Promise<string> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: HMAC_KEYCHAIN_SERVICE });
      if (credentials) return credentials.password;
      const newKey = CryptoJS.lib.WordArray.random(32).toString();
      await Keychain.setGenericPassword('hmacUser', newKey, { service: HMAC_KEYCHAIN_SERVICE });
      return newKey;
    } catch (error) {
      console.error('HMAC Keychain access error', error);
      throw error;
    }
  }

  public async logAttendance(
    workerId: string,
    gpsLat: number | null,
    gpsLng: number | null,
    confidenceScore: number,
    challengeType: string,
    deviceId: string
  ): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');
    
    const logId = uuidv4();
    const timestamp = Date.now();

    // Generate HMAC Signature to prevent tampering
    const secretKey = await this.getHmacKey();
    const dataToSign = `${workerId}|${gpsLat}|${gpsLng}|${timestamp}|${deviceId}`;
    const hmacSignature = CryptoJS.HmacSHA256(dataToSign, secretKey).toString();

    const query = `INSERT INTO attendance_logs (log_id, worker_id, timestamp, gps_lat, gps_lng, confidence_score, challenge_type, hmac_signature, device_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await this.db.executeSql(query, [logId, workerId, timestamp, gpsLat, gpsLng, confidenceScore, challengeType, hmacSignature, deviceId]);

    // Add to sync queue
    const queueId = uuidv4();
    await this.db.executeSql(`INSERT INTO sync_queue (queue_id, log_id, created_at) VALUES (?, ?, ?)`, [queueId, logId, timestamp]);

    return logId;
  }

  public async getPendingSyncRecords(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const [results] = await this.db.executeSql(`
      SELECT sq.queue_id, al.* 
      FROM sync_queue sq 
      JOIN attendance_logs al ON sq.log_id = al.log_id 
      WHERE al.sync_status = 'PENDING'
    `);
    
    const records = [];
    for (let i = 0; i < results.rows.length; i++) {
      records.push(results.rows.item(i));
    }
    return records;
  }

  // --- Data Purge Mechanism ---

  public async markRecordsSyncedAndPurge(queueIds: string[], logIds: string[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    // Chunk array into sizes of 50
    const chunkSize = 50;
    for (let i = 0; i < logIds.length; i += chunkSize) {
      const chunkLogIds = logIds.slice(i, i + chunkSize);
      const chunkQueueIds = queueIds.slice(i, i + chunkSize);

      const logPlaceholders = chunkLogIds.map(() => '?').join(',');
      const queuePlaceholders = chunkQueueIds.map(() => '?').join(',');

      if (chunkLogIds.length > 0) {
        await this.db.executeSql(
          `UPDATE attendance_logs SET sync_status = 'SYNCED', synced_at = ? WHERE log_id IN (${logPlaceholders})`,
          [Date.now(), ...chunkLogIds]
        );
      }

      if (chunkQueueIds.length > 0) {
        await this.db.executeSql(
          `DELETE FROM sync_queue WHERE queue_id IN (${queuePlaceholders})`,
          chunkQueueIds
        );
      }
    }

    // Purge records that are synced to free space
    await this.db.executeSql(`DELETE FROM attendance_logs WHERE sync_status = 'SYNCED'`);
  }
}

export const dbService = new DatabaseService();
