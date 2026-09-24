// Root entry point: wraps providers around the root navigator

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { GamificationProvider } from './src/context/GamificationContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <GamificationProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </GamificationProvider>
    </AuthProvider>
  );
}
