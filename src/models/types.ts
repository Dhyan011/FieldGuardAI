/**
 * FieldGuard AI — Data Models
 * Strong TypeScript interfaces for all entities
 */

export interface Worker {
  worker_id: string;
  name: string;
  department: string;
  phone: string;
  face_embedding: number[];  // 128-float face vector
  enrolled_by: string;
  enrollment_date: number;   // Unix timestamp ms
  is_active: boolean;
  photo_uri?: string;
}

export interface AttendanceLog {
  log_id: string;
  worker_id: string;
  worker_name: string;
  timestamp: number;
  gps_lat: number | null;
  gps_lng: number | null;
  confidence_score: number;
  challenge_type: 'BLINK_TWICE' | 'HEAD_TURN' | 'SMILE' | 'NONE';
  hmac_signature: string;
  sync_status: 'PENDING' | 'SYNCED' | 'FAILED';
  synced_at: number | null;
  device_id: string;
}

export interface SyncQueueItem {
  queue_id: string;
  log_id: string;
  created_at: number;
  retry_count: number;
  last_error: string | null;
}

export interface SupervisorSession {
  supervisor_id: string;
  authenticated_at: number;
  expires_at: number;
}

export interface AppStats {
  total_enrolled: number;
  today_attendance: number;
  pending_sync: number;
  last_sync_at: number | null;
}
