/**
 * SyncService — Cloud Synchronization Engine
 * 
 * Handles offline-first data sync with retry logic, 
 * batching, and network-aware auto-sync.
 */
import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo';
import { dbService } from './DatabaseService';

const MAX_RETRIES = 5;
const BATCH_SIZE = 50;
const CLOUD_API_URL = 'https://api.fieldguard.ai/v1'; // Configure for production

class SyncService {
  private isSyncing = false;
  private unsubscribe: NetInfoSubscription | null = null;

  /**
   * Initialize network listener for auto-sync
   */
  startAutoSync(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    
    this.unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        console.log('[Sync] Network available, attempting auto-sync...');
        this.sync();
      }
    });

    console.log('[Sync] Auto-sync listener started');
  }

  /**
   * Stop auto-sync listener
   */
  stopAutoSync(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    console.log('[Sync] Auto-sync listener stopped');
  }

  /**
   * Check current network status
   */
  async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return !!(state.isConnected && state.isInternetReachable);
  }

  /**
   * Main sync function — uploads pending records in batches
   */
  async sync(): Promise<{ synced: number; failed: number; remaining: number }> {
    if (this.isSyncing) {
      console.log('[Sync] Already syncing, skipping...');
      return { synced: 0, failed: 0, remaining: 0 };
    }

    this.isSyncing = true;
    let totalSynced = 0;
    let totalFailed = 0;

    try {
      const online = await this.isOnline();
      if (!online) {
        console.log('[Sync] No network, queuing for later...');
        const pending = await dbService.getPendingSyncRecords();
        return { synced: 0, failed: 0, remaining: pending.length };
      }

      const pendingRecords = await dbService.getPendingSyncRecords();
      
      if (pendingRecords.length === 0) {
        console.log('[Sync] No pending records');
        return { synced: 0, failed: 0, remaining: 0 };
      }

      console.log(`[Sync] Starting sync for ${pendingRecords.length} records...`);

      // Filter out records that exceeded max retries
      const retryable = pendingRecords.filter(r => r.retry_count < MAX_RETRIES);
      const dead = pendingRecords.filter(r => r.retry_count >= MAX_RETRIES);

      if (dead.length > 0) {
        console.log(`[Sync] ${dead.length} records exceeded max retries`);
      }

      // Process in batches
      for (let i = 0; i < retryable.length; i += BATCH_SIZE) {
        const batch = retryable.slice(i, i + BATCH_SIZE);
        const logIds = batch.map(r => r.log_id);

        try {
          // Get full attendance logs for this batch
          const allLogs = await dbService.getAllAttendanceLogs();
          const logsToSync = allLogs.filter(l => logIds.includes(l.log_id));

          // Upload to cloud API
          await this.uploadBatch(logsToSync);

          // Mark as synced
          await dbService.markRecordsSynced(logIds);
          totalSynced += logIds.length;

          console.log(`[Sync] Batch synced: ${logIds.length} records`);
        } catch (error: any) {
          totalFailed += batch.length;
          
          // Increment retry counts
          for (const item of batch) {
            await dbService.incrementRetryCount(item.log_id, error.message || 'Unknown error');
          }
          
          console.error(`[Sync] Batch failed:`, error.message);
        }
      }

      const remaining = await dbService.getPendingSyncCount();
      console.log(`[Sync] Complete: ${totalSynced} synced, ${totalFailed} failed, ${remaining} remaining`);

      return { synced: totalSynced, failed: totalFailed, remaining };
    } catch (error) {
      console.error('[Sync] Fatal error:', error);
      return { synced: totalSynced, failed: totalFailed, remaining: -1 };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Upload a batch of attendance logs to the cloud
   * In production, replace with your actual API call
   */
  private async uploadBatch(logs: any[]): Promise<void> {
    // Simulate cloud API call
    // In production, this would be:
    // await fetch(`${CLOUD_API_URL}/attendance/batch`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    //   body: JSON.stringify({ records: logs }),
    // });
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simulate 95% success rate
    if (Math.random() < 0.05) {
      throw new Error('Cloud API temporarily unavailable');
    }
  }

  /**
   * Force sync all records (ignoring retry limits)
   */
  async forceSync(): Promise<{ synced: number; failed: number }> {
    // Reset all retry counts first
    const pending = await dbService.getPendingSyncRecords();
    for (const item of pending) {
      if (item.retry_count >= MAX_RETRIES) {
        await dbService.incrementRetryCount(item.log_id, ''); // This resets by updating
      }
    }
    
    const result = await this.sync();
    return { synced: result.synced, failed: result.failed };
  }
}

export const syncService = new SyncService();
