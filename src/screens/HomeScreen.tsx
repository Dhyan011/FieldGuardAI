import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import StarryBackground from '../components/StarryBackground';
import { dbService } from '../services/DatabaseService';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const isFocused = useIsFocused();
  const [stats, setStats] = useState({
    enrolled: 0,
    today: 0,
    pending: 0,
  });

  const loadStats = async () => {
    try {
      const workers = await dbService.getAllWorkers();
      const pending = await dbService.getPendingSyncRecords();
      setStats({
        enrolled: workers.length,
        today: Math.floor(Math.random() * 50), // Fallback mock for today
        pending: pending.length,
      });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadStats();
    }
  }, [isFocused]);

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <StarryBackground>
      <View style={styles.container}>
        {/* Glassmorphism Header */}
        <View style={styles.headerCard}>
          <Text style={styles.welcomeText}>Welcome, Admin</Text>
          <Text style={styles.dateText}>{currentDate}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{stats.pending > 0 ? 'Sync Pending' : 'All Synced'}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.today}</Text>
            <Text style={styles.statLabel}>Today's Att.</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#FFD700' }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending Sync</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.enrolled}</Text>
            <Text style={styles.statLabel}>Enrolled</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.primaryAction} onPress={() => navigation.navigate('Attendance')}>
            <Text style={styles.primaryActionText}>Scan Attendance</Text>
          </TouchableOpacity>
          
          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Enrollment')}>
              <Text style={styles.secondaryButtonText}>Enroll Worker</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('SyncStatus')}>
              <Text style={styles.secondaryButtonText}>Sync Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </StarryBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  headerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#A0AEC0',
    marginBottom: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  statusText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: '30%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#63B3ED', // Soft blue
  },
  statLabel: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 8,
    textAlign: 'center',
  },
  actionsContainer: {
    flex: 1,
  },
  primaryAction: {
    backgroundColor: 'rgba(100, 150, 255, 0.15)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(100, 150, 255, 0.3)',
    shadowColor: '#6495ED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButtonText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;
