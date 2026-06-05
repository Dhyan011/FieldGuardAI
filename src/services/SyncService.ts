import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo';
import { dbService } from './DatabaseService';

class SyncService {
  private isSyncing = false;
  private unsubscribeNetInfo: NetInfoSubscription | null = null;

  public initNetworkListener() {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
    }
    
    this.unsubscribeNetInfo = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        this.startSync();
      }
    });

    return this.unsubscribeNetInfo;
  }

  public cleanup() {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
      this.unsubscribeNetInfo = null;
    }
  }

  public async startSync() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const pendingRecords = await dbService.getPendingSyncRecords();
      if (pendingRecords.length === 0) {
        this.isSyncing = false;
        return;
      }

      console.log(`Starting sync for ${pendingRecords.length} records...`);

      // Upload via AWS Amplify/SDK in chunks of 50
      const chunkSize = 50;
      for (let i = 0; i < pendingRecords.length; i += chunkSize) {
        const batch = pendingRecords.slice(i, i + chunkSize);
        
        // Mock API upload for this chunk
        await new Promise(resolve => setTimeout(resolve, 500));

        const logIds = batch.map(r => r.log_id);
        const queueIds = batch.map(r => r.queue_id);

        // Purge synced data for this chunk to free up space
        await dbService.markRecordsSyncedAndPurge(queueIds, logIds);
      }

      console.log('Sync complete & data purged.');
    } catch (error) {
      console.error('Sync failed', error);
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncService = new SyncService();
