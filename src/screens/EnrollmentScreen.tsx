import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { dbService } from '../services/DatabaseService';
import { useNavigation } from '@react-navigation/native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useFaceRecognition } from '../hooks/useFaceRecognition';

const EnrollmentScreen = () => {
  const [pin, setPin] = useState('');
  const [step, setStep] = useState(1); // 1 = PIN, 2 = Details, 3 = Face Scan
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  
  const navigation = useNavigation();
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    if (step === 3 && !hasPermission) {
      requestPermission();
    }
  }, [step, hasPermission]);

  const handlePinSubmit = () => {
    if (pin === '123456') { // Mock supervisor PIN
      setStep(2);
    } else {
      Alert.alert('Error', 'Invalid Supervisor PIN');
    }
  };

  const handleDetailsSubmit = () => {
    if (!name || !department) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setStep(3);
  };

  const onDetection = async (result: any) => {
    if (isEnrolling) return;
    
    if (result.success && result.embedding) {
      setIsEnrolling(true);
      try {
        await dbService.enrollWorker(name, department, phone, result.embedding, 'SUP-001');
        Alert.alert('Success', `${name} enrolled successfully!`);
        navigation.goBack();
      } catch (err) {
        Alert.alert('Error', 'Failed to enroll worker');
        setIsEnrolling(false);
      }
    }
  };

  const { frameProcessor } = useFaceRecognition('ENROLLMENT', onDetection);

  return (
    <View style={styles.container}>
      {step === 1 && (
        <View style={styles.card}>
          <Text style={styles.title}>Supervisor Login</Text>
          <Text style={styles.subtitle}>Enter 6-digit PIN to authorize</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            keyboardType="number-pad"
            maxLength={6}
            value={pin}
            onChangeText={setPin}
            placeholder="PIN"
            placeholderTextColor="#6B7280"
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handlePinSubmit}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View style={styles.card}>
          <Text style={styles.title}>Worker Details</Text>
          <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#6B7280" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Department" placeholderTextColor="#6B7280" value={department} onChangeText={setDepartment} />
          <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#6B7280" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          
          <TouchableOpacity style={styles.primaryButton} onPress={handleDetailsSubmit}>
            <Text style={styles.buttonText}>Next: Face Scan</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 3 && (
        <View style={styles.cameraContainer}>
          <Text style={styles.cameraTitle}>Face Registration</Text>
          <Text style={styles.cameraSubtitle}>Look directly into the camera</Text>
          
          <View style={styles.cameraFrame}>
            {device != null && hasPermission ? (
              <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                frameProcessor={frameProcessor}
              />
            ) : (
              <Text style={{color: '#fff'}}>Camera unavailable</Text>
            )}
            {/* Elegant scanning ring */}
            <View style={styles.scanningRing} />
          </View>
          
          <Text style={styles.scanningText}>{isEnrolling ? 'Enrolling...' : 'Scanning...'}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0a0b1e', // Dark theme to match starry night vibe
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0AEC0',
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
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
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  cameraSubtitle: {
    fontSize: 16,
    color: '#A0AEC0',
    marginBottom: 40,
  },
  cameraFrame: {
    width: 300,
    height: 400,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(100, 150, 255, 0.3)',
  },
  scanningRing: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.6)',
    borderStyle: 'dashed',
  },
  scanningText: {
    marginTop: 30,
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
  }
});

export default EnrollmentScreen;
