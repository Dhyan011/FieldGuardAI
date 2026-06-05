import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { dbService } from '../services/DatabaseService';
import { syncService } from '../services/SyncService';
import { useIsFocused } from '@react-navigation/native';
import StarryBackground from '../components/StarryBackground';

const SyncStatusScreen = () => {
  const isFocused = useIsFocused();
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  const loadData = async () => {
    const stats = await dbService.getStats();
    setPendingCount(stats.pending_sync);
    setLastSync(stats.last_sync_at);
  };

  useEffect(() => {
    if (isFocused) {
      loadData();
      addLog('Ready.');
    }
  }, [isFocused]);

  const handleManualSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    addLog('Checking network...');
    
    const online = await syncService.isOnline();
    if (!online) {
      addLog('No internet connection.');
      Alert.alert('Offline', 'Please connect to the internet to sync data.');
      setIsSyncing(false);
      return;
    }

    addLog(`Starting sync for ${pendingCount} records...`);
    
    const result = await syncService.forceSync();
    
    addLog(`Sync complete! Synced: ${result.synced}, Failed: ${result.failed}`);
    
    if (result.synced > 0) {
      Alert.alert('Sync Successful', `Successfully synchronized ${result.synced} records to the cloud.`);
    } else if (result.failed > 0) {
      Alert.alert('Sync Incomplete', `Failed to sync ${result.failed} records. Please try again later.`);
    }

    await loadData();
    setIsSyncing(false);
  };

  return (
    <StarryBackground>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Cloud Synchronization</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: pendingCount > 0 ? '#F6AD55' : '#4ADE80' }]}>
                {pendingCount}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>
                {lastSync ? new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
              </Text>
              <Text style={styles.statLabel}>Last Sync</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]} 
            onPress={handleManualSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.syncButtonText}>
                {pendingCount > 0 ? 'Sync Now' : 'Check for Sync'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.logContainer}>
          <Text style={styles.logTitle}>System Logs</Text>
          <ScrollView style={styles.logScroll}>
            {logs.map((log, i) => (
              <Text key={i} style={styles.logText}>{log}</Text>
            ))}
            {logs.length === 0 && <Text style={styles.logText}>No logs available.</Text>}
          </ScrollView>
        </View>
      </View>
    </StarryBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30 },
  statBox: { alignItems: 'center' },
  statNum: { fontSize: 32, fontWeight: 'bold', color: '#63B3ED' },
  statLabel: { fontSize: 14, color: '#A0AEC0', marginTop: 4 },
  syncButton: {
    backgroundColor: 'rgba(100, 150, 255, 0.2)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(100, 150, 255, 0.4)',
  },
  syncButtonDisabled: { opacity: 0.5 },
  syncButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  logContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  logTitle: { fontSize: 16, fontWeight: 'bold', color: '#A0AEC0', marginBottom: 10 },
  logScroll: { flex: 1 },
  logText: { color: '#68D391', fontFamily: 'monospace', fontSize: 12, marginBottom: 6 },
});

export default SyncStatusScreen;
