import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import './global.css';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import our root navigator
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { NetworkConfig, createInsecureFetch } from './src/utils/networkUtils';
import { getAuthToken } from './src/services/api.service';
import { initializeAuthToken } from './src/services/http.service';
import { authMonitor } from './src/utils/authMonitor';

export default function App() {
  // Configure network settings when the app starts
  useEffect(() => {
    // Immediate function to allow async operations
    const initialize = async () => {
      console.log('🚀 Starting app initialization');
      
      try {
        // First reset token state in case there was a previous error
        const { tokenValidator } = require('./src/utils/tokenValidator');
        await tokenValidator.resetTokenState();
        
        // Initialize auth token from storage
        await initializeAuthToken();
        console.log('🔑 Auth token initialization complete');
        
        // Log token diagnostics for debugging
        await tokenValidator.logTokenDiagnostics();
      } catch (error) {
        console.error('Error initializing auth token:', error);
      }
      
      // Start the authentication monitor
      authMonitor.startMonitoring();
      
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
    };
    
    initialize();
    
    // Cleanup function
    return () => {
      authMonitor.stopMonitoring();
    };
  }, []);

  return (
    <AuthProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
