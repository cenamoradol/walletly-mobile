import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/theme/theme';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';

function AppContent() {
  const { isLoggedIn, loading } = useAuth();
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  if (!fontsLoaded || loading) {
    return null; // Or a splash screen
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <AppNavigator isLoggedIn={isLoggedIn} />
    </NavigationContainer>
  );
}

import { CurrencyProvider } from './src/context/CurrencyContext';

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <AppContent />
      </CurrencyProvider>
    </AuthProvider>
  );
}
