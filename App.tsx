import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  NavigationContainer,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import ShiftsScreen from './src/screens/shiftsScreen';
import CreateShiftScreen from './src/screens/CreateShiftScreen';
import ActiveShiftScreen from './src/screens/ActiveShiftScreen';

import { loginApi } from './src/services/api';
import {
  clearSession,
  getSession,
  saveSession,
} from './src/storage/authStorage';
import { getActiveShift } from './src/storage/shiftStorage';

export type RootStackParamList = {
  Shifts: undefined;
  CreateShift: undefined;
  ActiveShift: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [hasActiveShift, setHasActiveShift] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const storedSession = await getSession();

      if (storedSession) {
        setSession(storedSession);

        const activeShift = await getActiveShift();

        setHasActiveShift(!!activeShift);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (
    email: string,
    password: string,
  ) => {
    const response = await loginApi(email, password);

    await saveSession(response.token, response.user);

    const activeShift = await getActiveShift();
    setHasActiveShift(!!activeShift);

    setSession(response);
  };

  const handleLogout = async () => {
    await clearSession();
    setSession(null);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={hasActiveShift ? 'ActiveShift' : 'Shifts'}
          screenOptions={{
            headerStyle: { backgroundColor: '#FFFFFF' },
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: '700', fontSize: 18, color: '#0F172A' },
            headerTintColor: '#0F172A',
            contentStyle: { backgroundColor: '#F8FAFC' },
          }}
        >
          <Stack.Screen
            name="Shifts"
            options={{ headerShown: false }}
          >
            {({ navigation }) => (
              <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
                <ShiftsScreen
                  onCreateShift={() =>
                    navigation.navigate('CreateShift')
                  }
                  onStartShift={() =>
                    navigation.navigate('ActiveShift')
                  }
                  onLogout={handleLogout}
                />
              </SafeAreaView>
            )}
          </Stack.Screen>

          <Stack.Screen
            name="CreateShift"
            options={{ title: 'Create New Shift' }}
          >
            {({ navigation }) => (
              <CreateShiftScreen
                onCreated={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>

          <Stack.Screen
            name="ActiveShift"
            options={{ title: 'Shift Tracker' }}
          >
            {({ navigation }) => (
              <ActiveShiftScreen
                onEnded={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});