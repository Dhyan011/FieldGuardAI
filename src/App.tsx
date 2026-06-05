import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import Screens (Placeholders)
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import EnrollmentScreen from './screens/EnrollmentScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import AttendanceLogScreen from './screens/AttendanceLogScreen';
import SyncStatusScreen from './screens/SyncStatusScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import SettingsScreen from './screens/SettingsScreen';
import { syncService } from './services/SyncService';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Enrollment: undefined;
  Attendance: undefined;
  AttendanceLog: undefined;
  SyncStatus: undefined;
  AdminDashboard: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  React.useEffect(() => {
    syncService.startAutoSync();
    return () => syncService.stopAutoSync();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Splash"
          screenOptions={{
            headerStyle: { backgroundColor: '#1D9E75' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            animation: 'slide_from_right'
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
          <Stack.Screen name="Enrollment" component={EnrollmentScreen} options={{ title: 'Worker Enrollment' }} />
          <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AttendanceLog" component={AttendanceLogScreen} options={{ title: 'Attendance Logs' }} />
          <Stack.Screen name="SyncStatus" component={SyncStatusScreen} options={{ title: 'Sync Status' }} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin Overview' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
