/**
 * DatabaseService — Core Data Layer
 * 
 * Persistent local database using MMKV encrypted storage.
 * All data survives app restarts.
 * Includes HMAC tamper-protection on attendance logs.
 */
import StorageService from './StorageService';
import { Worker, AttendanceLog, SyncQueueItem, AppStats } from '../models/types';
import CryptoJS from 'crypto-js';

const WORKERS_KEY = 'db_workers';
const ATTENDANCE_KEY = 'db_attendance_logs';
const SYNC_QUEUE_KEY = 'db_sync_queue';
const HMAC_SECRET = 'fieldguard-hmac-secret-2024';

class DatabaseService {
  // ==========================================
  //  WORKER OPERATIONS
  // ==========================================

  /**
   * Enroll a new worker with face embedding
   */
  async enrollWorker(
    name: string,
    department: string,
    phone: string,
    faceEmbedding: number[] | Float32Array,
    enrolledBy: string
  ): Promise<string> {
    const workerId = `WRK-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    const worker: Worker = {
      worker_id: workerId,
      name: name.trim(),
      department: department.trim(),
      phone: phone.trim(),
      face_embedding: Array.from(faceEmbedding),
      enrolled_by: enrolledBy,
      enrollment_date: Date.now(),
      is_active: true,
    };

    StorageService.appendToArray<Worker>(WORKERS_KEY, worker);
    console.log(`[DB] Enrolled worker: ${name} (${workerId})`);
    
    return workerId;
  }

  /**
   * Get all active workers
   */
  async getAllWorkers(): Promise<Worker[]> {
    const workers = StorageService.getJSON<Worker[]>(WORKERS_KEY) || [];
    return workers.filter(w => w.is_active);
  }

  /**
   * Get worker by ID
   */
  async getWorkerById(workerId: string): Promise<Worker | null> {
    const workers = await this.getAllWorkers();
    return workers.find(w => w.worker_id === workerId) || null;
  }

  /**
   * Deactivate a worker (soft delete)
   */
  async deactivateWorker(workerId: string): Promise<void> {
    StorageService.updateInArray<Worker>(
      WORKERS_KEY,
      w => w.worker_id === workerId,
      w => ({ ...w, is_active: false })
    );
    console.log(`[DB] Deactivated worker: ${workerId}`);
  }

  /**
   * Get total enrolled count
   */
  async getEnrolledCount(): Promise<number> {
    const workers = await this.getAllWorkers();
    return workers.length;
  }

  // ==========================================
  //  ATTENDANCE OPERATIONS
  // ==========================================

  /**
   * Log an attendance record with HMAC tamper protection
   */
  async logAttendance(
    workerId: string,
    gpsLat: number | null,
    gpsLng: number | null,
    confidenceScore: number,
    challengeType: 'BLINK_TWICE' | 'HEAD_TURN' | 'SMILE' | 'NONE',
    deviceId: string
  ): Promise<string> {
    const logId = `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const timestamp = Date.now();

    // Get worker name for display
    const worker = await this.getWorkerById(workerId);
    const workerName = worker?.name || 'Unknown';

    // Generate HMAC signature to prevent tampering
    const dataToSign = `${workerId}|${gpsLat}|${gpsLng}|${timestamp}|${deviceId}`;
    const hmacSignature = CryptoJS.HmacSHA256(dataToSign, HMAC_SECRET).toString();

    const log: AttendanceLog = {
      log_id: logId,
      worker_id: workerId,
      worker_name: workerName,
      timestamp,
      gps_lat: gpsLat,
      gps_lng: gpsLng,
      confidence_score: confidenceScore,
      challenge_type: challengeType,
      hmac_signature: hmacSignature,
      sync_status: 'PENDING',
      synced_at: null,
      device_id: deviceId,
    };

    StorageService.appendToArray<AttendanceLog>(ATTENDANCE_KEY, log);

    // Add to sync queue
    const queueItem: SyncQueueItem = {
      queue_id: `Q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      log_id: logId,
      created_at: timestamp,
      retry_count: 0,
      last_error: null,
    };
    StorageService.appendToArray<SyncQueueItem>(SYNC_QUEUE_KEY, queueItem);

    console.log(`[DB] Attendance logged: ${workerName} (${logId})`);
    return logId;
  }

  /**
   * Verify HMAC integrity of an attendance log
   */
  verifyLogIntegrity(log: AttendanceLog): boolean {
    const dataToSign = `${log.worker_id}|${log.gps_lat}|${log.gps_lng}|${log.timestamp}|${log.device_id}`;
    const expectedHmac = CryptoJS.HmacSHA256(dataToSign, HMAC_SECRET).toString();
    return expectedHmac === log.hmac_signature;
  }

  /**
   * Get all attendance logs
   */
  async getAllAttendanceLogs(): Promise<AttendanceLog[]> {
    return StorageService.getJSON<AttendanceLog[]>(ATTENDANCE_KEY) || [];
  }

  /**
   * Get today's attendance logs
   */
  async getTodayAttendance(): Promise<AttendanceLog[]> {
    const logs = await this.getAllAttendanceLogs();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return logs.filter(l => l.timestamp >= todayStart.getTime());
  }

  /**
   * Get attendance logs for a specific worker
   */
  async getWorkerAttendance(workerId: string): Promise<AttendanceLog[]> {
    const logs = await this.getAllAttendanceLogs();
    return logs.filter(l => l.worker_id === workerId);
  }

  // ==========================================
  //  SYNC OPERATIONS
  // ==========================================

  /**
   * Get all pending sync records
   */
  async getPendingSyncRecords(): Promise<SyncQueueItem[]> {
    return StorageService.getJSON<SyncQueueItem[]>(SYNC_QUEUE_KEY) || [];
  }

  /**
   * Get pending sync count
   */
  async getPendingSyncCount(): Promise<number> {
    const queue = await this.getPendingSyncRecords();
    return queue.length;
  }

  /**
   * Mark records as synced and remove from queue
   */
  async markRecordsSynced(logIds: string[]): Promise<void> {
    // Update attendance logs
    const logs = StorageService.getJSON<AttendanceLog[]>(ATTENDANCE_KEY) || [];
    const updated = logs.map(log => {
      if (logIds.includes(log.log_id)) {
        return { ...log, sync_status: 'SYNCED' as const, synced_at: Date.now() };
      }
      return log;
    });
    StorageService.setJSON(ATTENDANCE_KEY, updated);

    // Remove from sync queue
    const queue = StorageService.getJSON<SyncQueueItem[]>(SYNC_QUEUE_KEY) || [];
    const remaining = queue.filter(q => !logIds.includes(q.log_id));
    StorageService.setJSON(SYNC_QUEUE_KEY, remaining);

    console.log(`[DB] Marked ${logIds.length} records as synced`);
  }

  /**
   * Increment retry count for failed sync items
   */
  async incrementRetryCount(logId: string, error: string): Promise<void> {
    StorageService.updateInArray<SyncQueueItem>(
      SYNC_QUEUE_KEY,
      q => q.log_id === logId,
      q => ({ ...q, retry_count: q.retry_count + 1, last_error: error })
    );
  }

  // ==========================================
  //  STATS & DASHBOARD
  // ==========================================

  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<AppStats> {
    const workers = await this.getAllWorkers();
    const todayLogs = await this.getTodayAttendance();
    const pendingSync = await this.getPendingSyncCount();

    const lastSyncLog = (await this.getAllAttendanceLogs())
      .filter(l => l.synced_at !== null)
      .sort((a, b) => (b.synced_at || 0) - (a.synced_at || 0))[0];

    return {
      total_enrolled: workers.length,
      today_attendance: todayLogs.length,
      pending_sync: pendingSync,
      last_sync_at: lastSyncLog?.synced_at || null,
    };
  }

  // ==========================================
  //  DATA MANAGEMENT
  // ==========================================

  /**
   * Purge all synced attendance logs older than 30 days
   */
  async purgeOldSyncedLogs(): Promise<number> {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const logs = StorageService.getJSON<AttendanceLog[]>(ATTENDANCE_KEY) || [];
    const remaining = logs.filter(l => 
      l.sync_status !== 'SYNCED' || l.timestamp > thirtyDaysAgo
    );
    const purged = logs.length - remaining.length;
    StorageService.setJSON(ATTENDANCE_KEY, remaining);
    console.log(`[DB] Purged ${purged} old synced logs`);
    return purged;
  }

  /**
   * Export all data as JSON (for backup/debug)
   */
  async exportAllData(): Promise<object> {
    return {
      workers: await this.getAllWorkers(),
      attendance_logs: await this.getAllAttendanceLogs(),
      sync_queue: await this.getPendingSyncRecords(),
      stats: await this.getStats(),
      exported_at: new Date().toISOString(),
    };
  }

  /**
   * Clear all data (factory reset)
   */
  async clearAllData(): Promise<void> {
    StorageService.delete(WORKERS_KEY);
    StorageService.delete(ATTENDANCE_KEY);
    StorageService.delete(SYNC_QUEUE_KEY);
    console.log('[DB] All data cleared');
  }
}

export const dbService = new DatabaseService();
