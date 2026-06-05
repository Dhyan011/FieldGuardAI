import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import { dbService } from '../services/DatabaseService';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';

const EnrollmentScreen = () => {
  const [pin, setPin] = useState('');
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  
  const navigation = useNavigation();
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (step === 3 && !hasPermission) {
      requestPermission();
    }
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [step, hasPermission]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handlePinSubmit = () => {
    if (pin === '123456') {
      setStep(2);
    } else {
      Alert.alert('Error', 'Invalid Supervisor PIN\n\nHint: Use 123456');
    }
  };

  const handleDetailsSubmit = () => {
    if (!name || !department) {
      Alert.alert('Error', 'Please fill Name and Department');
      return;
    }
    setStep(3);
  };

  const handleCaptureFace = async () => {
    if (isEnrolling) return;
    setIsEnrolling(true);

    try {
      // Simulate face embedding capture
      const mockEmbedding = new Float32Array(128).fill(0).map(() => Math.random());
      
      const workerId = await dbService.enrollWorker(name, department, phone, mockEmbedding, 'SUP-001');
      
      Alert.alert(
        '✓ Enrollment Complete', 
        `${name} has been enrolled successfully!\n\nWorker ID: ${workerId}\nDepartment: ${department}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to enroll worker. Please try again.');
      setIsEnrolling(false);
    }
  };

  return (
    <View style={styles.container}>
      {step === 1 && (
        <View style={styles.card}>
          <Text style={styles.title}>Supervisor Login</Text>
          <Text style={styles.subtitle}>Enter 6-digit PIN to authorize enrollment</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            keyboardType="number-pad"
            maxLength={6}
            value={pin}
            onChangeText={setPin}
            placeholder="Enter PIN"
            placeholderTextColor="#6B7280"
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handlePinSubmit}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
          <Text style={styles.hintText}>Demo PIN: 123456</Text>
        </View>
      )}

      {step === 2 && (
        <View style={styles.card}>
          <Text style={styles.title}>Worker Details</Text>
          <Text style={styles.subtitle}>Enter worker information</Text>
          <TextInput style={styles.input} placeholder="Full Name *" placeholderTextColor="#6B7280" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Department *" placeholderTextColor="#6B7280" value={department} onChangeText={setDepartment} />
          <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#6B7280" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          
          <TouchableOpacity style={styles.primaryButton} onPress={handleDetailsSubmit}>
            <Text style={styles.buttonText}>Next: Face Scan →</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 3 && (
        <View style={styles.cameraContainer}>
          <Text style={styles.cameraTitle}>Face Registration</Text>
          <Text style={styles.cameraSubtitle}>Position face in the circle and tap Capture</Text>
          
          <Animated.View style={[styles.cameraFrame, pulseStyle]}>
            {device != null && hasPermission ? (
              <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                photo={true}
              />
            ) : (
              <View style={styles.cameraBg}>
                <Text style={styles.cameraPlaceholderText}>📷</Text>
                <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
                  <Text style={styles.permBtnText}>Enable Camera</Text>
                </TouchableOpacity>
              </View>
            )}
            {/* Scanning ring */}
            <View style={styles.scanningRing} />
          </Animated.View>
          
          <Text style={styles.scanningText}>
            {isEnrolling ? '⏳ Enrolling...' : `Enrolling: ${name}`}
          </Text>

          <TouchableOpacity 
            style={[styles.captureButton, isEnrolling && styles.captureButtonDisabled]} 
            onPress={handleCaptureFace} 
            disabled={isEnrolling}
          >
            <Text style={styles.captureButtonText}>{isEnrolling ? 'Processing...' : '📸 Capture & Enroll'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0a0b1e',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#A0AEC0', marginBottom: 24 },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: 'rgba(100, 150, 255, 0.2)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(100, 150, 255, 0.4)',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  hintText: { color: '#6B7280', fontSize: 13, textAlign: 'center', marginTop: 16 },
  cameraContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  cameraSubtitle: { fontSize: 15, color: '#A0AEC0', marginBottom: 30 },
  cameraFrame: {
    width: 300,
    height: 380,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(100, 150, 255, 0.3)',
  },
  cameraBg: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' },
  cameraPlaceholderText: { fontSize: 60, opacity: 0.4, marginBottom: 16 },
  permBtn: { backgroundColor: 'rgba(100,150,255,0.3)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  permBtnText: { color: '#fff', fontSize: 14 },
  scanningRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    borderStyle: 'dashed',
  },
  scanningText: { marginTop: 24, fontSize: 16, color: '#FFD700', fontWeight: 'bold' },
  captureButton: {
    marginTop: 20,
    backgroundColor: 'rgba(29, 158, 117, 0.3)',
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(29, 158, 117, 0.6)',
  },
  captureButtonDisabled: { opacity: 0.5 },
  captureButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});

export default EnrollmentScreen;
