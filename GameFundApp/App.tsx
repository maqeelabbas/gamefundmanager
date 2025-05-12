import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import './global.css';

// Import our root navigator
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { NetworkConfig, createInsecureFetch } from './src/utils/networkUtils';

export default function App() {
  // Configure network settings when the app starts
  useEffect(() => {
    // Only configure in development mode
    if (__DEV__) {
      console.log('🚀 Starting app in development mode');
      // Configure network security for development
      NetworkConfig.configureNetworkSecurity(true);
      
      // Create an insecure fetch implementation for both iOS and Android
      // This bypasses SSL certificate validation in development
      createInsecureFetch();
      
      // Log the platform and API configuration
      console.log(`📱 Running on ${Platform.OS} ${Platform.Version}`);
      // Import dynamically to avoid circular dependencies
      const { API_CONFIG } = require('./src/config/api.config');
      console.log(`📡 API endpoint: ${API_CONFIG.BASE_URL}`);
    }
  }, []);

  return (
    <AuthProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
