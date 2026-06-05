import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { dbService } from '../services/DatabaseService';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';

type AttendanceScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Attendance'>;

const AttendanceScreen = () => {
  const navigation = useNavigation<AttendanceScreenNavigationProp>();
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isScanning, setIsScanning] = useState(true);
  const [matchResult, setMatchResult] = useState<'IDLE' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [workerName, setWorkerName] = useState('');

  const scanLineY = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
    scanLineY.value = withRepeat(
      withSequence(
        withTiming(300, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [hasPermission]);

  const handleScanPress = async () => {
    if (!isScanning) return;
    setIsScanning(false);

    // Simulate AI face recognition
    const workers = await dbService.getAllWorkers();
    
    if (workers.length > 0) {
      // Simulate a match with the first enrolled worker
      const matched = workers[Math.floor(Math.random() * workers.length)];
      setMatchResult('SUCCESS');
      setWorkerName(matched.name);
      
      await dbService.logAttendance(
        matched.worker_id,
        23.0225,  // Mock GPS
        72.5714,
        0.95,
        'BLINK_TWICE',
        'device-001'
      );

      setTimeout(() => {
        Alert.alert('Attendance Logged', `Welcome, ${matched.name}! Attendance recorded successfully.`, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }, 1500);
    } else {
      setMatchResult('FAILED');
      setTimeout(() => {
        Alert.alert('No Workers Enrolled', 'Please enroll workers first before scanning attendance.', [
          { text: 'OK', onPress: () => { setMatchResult('IDLE'); setIsScanning(true); } }
        ]);
      }, 1500);
    }
  };

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No front camera found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Live Camera Feed */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Scanner Overlay */}
      <View style={styles.overlay}>
        <Animated.View style={[styles.scannerBox, pulseStyle]}>
          <Animated.View style={[styles.scanLine, scanLineStyle]} />
          {/* Corner markers */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </Animated.View>

        <Text style={styles.instruction}>
          {matchResult === 'IDLE' ? 'Align face in frame' : 
           matchResult === 'SUCCESS' ? `✓ Welcome, ${workerName}!` : 
           '✗ Face not recognized'}
        </Text>
      </View>

      {/* Result Card */}
      {matchResult !== 'IDLE' && (
        <View style={styles.resultContainer}>
          <View style={[styles.resultCard, matchResult === 'SUCCESS' ? styles.successCard : styles.errorCard]}>
            <Text style={styles.resultEmoji}>{matchResult === 'SUCCESS' ? '✓' : '✗'}</Text>
            <Text style={styles.resultText}>
              {matchResult === 'SUCCESS' ? `${workerName}\nAttendance Recorded` : 'Face Not Recognized'}
            </Text>
          </View>
        </View>
      )}

      {/* Bottom Controls */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.scanBtn, !isScanning && styles.scanBtnDisabled]} 
          onPress={handleScanPress}
          disabled={!isScanning}
        >
          <View style={styles.scanBtnInner}>
            <Text style={styles.scanBtnText}>{isScanning ? 'SCAN' : 'Processing...'}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.statusDot}>
          <View style={[styles.dot, { backgroundColor: '#4ADE80' }]} />
          <Text style={styles.statusText}>LIVE</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  permissionText: { color: '#fff', fontSize: 18, marginBottom: 20 },
  permissionButton: { backgroundColor: 'rgba(100,150,255,0.3)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(100,150,255,0.5)' },
  permissionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerBox: {
    width: 260,
    height: 320,
    borderWidth: 2,
    borderColor: 'rgba(100, 150, 255, 0.5)',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 40,
  },
  scanLine: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(100, 150, 255, 0.9)',
    shadowColor: '#6495ED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  corner: { position: 'absolute', width: 35, height: 35, borderColor: '#FFD700' },
  topLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 20 },
  topRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 20 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 20 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 20 },
  instruction: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    fontSize: 16,
    fontWeight: '600',
    position: 'absolute',
    bottom: 120,
    textAlign: 'center',
  },
  resultContainer: { position: 'absolute', top: 80, left: 20, right: 20, alignItems: 'center' },
  resultCard: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  successCard: { backgroundColor: 'rgba(29, 158, 117, 0.95)', borderWidth: 1, borderColor: '#34D399' },
  errorCard: { backgroundColor: 'rgba(220, 38, 38, 0.95)', borderWidth: 1, borderColor: '#F87171' },
  resultEmoji: { fontSize: 28, marginRight: 12, color: '#fff' },
  resultText: { color: '#fff', fontSize: 16, fontWeight: 'bold', lineHeight: 22 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 150, 255, 0.15)',
  },
  backBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  backBtnText: { color: '#A0AEC0', fontSize: 16, fontWeight: '600' },
  scanBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(100, 150, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(100, 150, 255, 0.6)',
  },
  scanBtnDisabled: { opacity: 0.5 },
  scanBtnInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(100, 150, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  statusDot: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { color: '#4ADE80', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
});

export default AttendanceScreen;
