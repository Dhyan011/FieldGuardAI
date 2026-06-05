import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useFaceRecognition } from '../hooks/useFaceRecognition';
import { dbService } from '../services/DatabaseService';
import { getCurrentLocation } from '../services/LocationService';
import { cosineSimilarity } from '../services/AIPipelineService';
import { useNavigation } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';

const AttendanceScreen = () => {
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [matchStatus, setMatchStatus] = useState<'IDLE' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [workerName, setWorkerName] = useState<string>('');
  const navigation = useNavigation();

  const scanLineY = useSharedValue(0);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
    // Simple scanner animation
    scanLineY.value = withRepeat(
      withSequence(
        withTiming(300, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [hasPermission]);

  const onDetection = async (result: any) => {
    if (matchStatus !== 'IDLE') return; // Debounce

    if (result.success && result.embedding) {
      try {
        const workers = await dbService.getAllWorkers();
        let bestMatch = null;
        let highestScore = 0;

        for (const worker of workers) {
           const score = cosineSimilarity(result.embedding, worker.face_embedding);
           if (score > highestScore && score > 0.6) {
             highestScore = score;
             bestMatch = worker;
           }
        }

        if (bestMatch) {
          setMatchStatus('SUCCESS');
          setWorkerName(bestMatch.name);
          
          let lat = null, lng = null;
          try {
             const loc = await getCurrentLocation();
             lat = loc.lat;
             lng = loc.lng;
          } catch (e) {
             console.log('GPS unavailable');
          }

          await dbService.logAttendance(bestMatch.worker_id, lat, lng, highestScore, 'BLINK_TWICE', 'device-1234');
          setTimeout(() => {
            navigation.goBack();
          }, 2000);
        } else {
          setMatchStatus('FAILED');
          setTimeout(() => {
            setMatchStatus('IDLE');
          }, 2000);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const { frameProcessor } = useFaceRecognition('ATTENDANCE', onDetection);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  if (!hasPermission) return <View style={styles.container}><Text style={styles.text}>No Camera Permission</Text></View>;
  if (device == null) return <View style={styles.container}><Text style={styles.text}>No Camera Device</Text></View>;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
      />
      
      {/* Scanner Overlay */}
      <View style={styles.overlay}>
        <View style={styles.scannerBox}>
          <Animated.View style={[styles.scanLine, scanLineStyle]} />
        </View>
        <Text style={styles.instruction}>Align face in frame for Liveness Check</Text>
      </View>

      {/* Result Card */}
      {matchStatus !== 'IDLE' && (
        <View style={styles.resultContainer}>
          <View style={[styles.resultCard, matchStatus === 'SUCCESS' ? styles.successCard : styles.errorCard]}>
            <Text style={styles.resultText}>
              {matchStatus === 'SUCCESS' ? `Welcome, ${workerName}!` : 'Face not recognized'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  text: { color: '#fff', textAlign: 'center' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerBox: {
    width: 250,
    height: 300,
    borderWidth: 2,
    borderColor: 'rgba(100, 150, 255, 0.5)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 40,
  },
  scanLine: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(100, 150, 255, 0.8)',
    shadowColor: '#6495ED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  instruction: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 16,
    fontWeight: '600',
    position: 'absolute',
    bottom: 60,
  },
  resultContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  resultCard: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  successCard: {
    backgroundColor: 'rgba(29, 158, 117, 0.9)',
    borderWidth: 1,
    borderColor: '#34D399',
  },
  errorCard: {
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    borderWidth: 1,
    borderColor: '#F87171',
  },
  resultText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AttendanceScreen;
