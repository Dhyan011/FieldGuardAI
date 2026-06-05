/**
 * DatabaseService - Mock implementation
 * In production, this would use SQLCipher for encrypted storage.
 * For the demo/hackathon build, we use in-memory mock data.
 */

class DatabaseService {
  private workers: any[] = [];
  private attendanceLogs: any[] = [];
  private syncQueue: any[] = [];

  public async initDatabase(): Promise<void> {
    // Mock initialization - no native SQLite dependency needed for demo
    console.log('[DatabaseService] Initialized (mock mode)');
  }

  public async enrollWorker(
    name: string,
    department: string,
    phone: string,
    faceEmbedding: any,
    enrolledBy: string
  ): Promise<string> {
    const workerId = `WRK-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    this.workers.push({
      worker_id: workerId,
      name,
      department,
      phone,
      face_embedding: faceEmbedding,
      enrolled_by: enrolledBy,
      enrollment_date: Date.now(),
      is_active: 1,
    });
    return workerId;
  }

  public async getAllWorkers(): Promise<any[]> {
    return this.workers.filter(w => w.is_active === 1);
  }

  public async logAttendance(
    workerId: string,
    gpsLat: number | null,
    gpsLng: number | null,
    confidenceScore: number,
    challengeType: string,
    deviceId: string
  ): Promise<string> {
    const logId = `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const timestamp = Date.now();

    this.attendanceLogs.push({
      log_id: logId,
      worker_id: workerId,
      timestamp,
      gps_lat: gpsLat,
      gps_lng: gpsLng,
      confidence_score: confidenceScore,
      challenge_type: challengeType,
      hmac_signature: 'mock-hmac',
      sync_status: 'PENDING',
      device_id: deviceId,
    });

    this.syncQueue.push({
      queue_id: `Q-${Date.now()}`,
      log_id: logId,
      created_at: timestamp,
      retry_count: 0,
    });

    return logId;
  }

  public async getPendingSyncRecords(): Promise<any[]> {
    return this.syncQueue;
  }

  public async markRecordsSyncedAndPurge(queueIds: string[], logIds: string[]): Promise<void> {
    this.syncQueue = this.syncQueue.filter(q => !queueIds.includes(q.queue_id));
    this.attendanceLogs = this.attendanceLogs.map(log => {
      if (logIds.includes(log.log_id)) {
        return { ...log, sync_status: 'SYNCED', synced_at: Date.now() };
      }
      return log;
    });
  }
}

export const dbService = new DatabaseService();
