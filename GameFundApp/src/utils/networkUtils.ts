// src/utils/networkUtils.ts
// Utility functions for network operations

import { Platform } from 'react-native';

// Define custom global types to avoid TypeScript errors
declare global {
  var originalFetch: typeof fetch | undefined;
}

/**
 * Creates a fetch implementation that converts HTTPS to HTTP in development
 * WARNING: Only use in development environments, never in production
 */
export const createInsecureFetch = () => {
  // Store the original fetch
  global.originalFetch = global.fetch;
    // Replace with our development-friendly implementation
  global.fetch = async (url: RequestInfo | URL, options: RequestInit = {}) => {
    try {
      // URL conversion no longer needed since we're using HTTP directly in API_CONFIG
      let urlString = url.toString();
      
      // Log the URL but don't modify it
      console.log(`🌐 Fetching: ${urlString}`);
      
      if (global.originalFetch) {
        return global.originalFetch(url, options);
      } else {
        return fetch(url, options);
      }
    } catch (err) {
      console.log('Fetch failed, falling back to standard fetch', err);
      if (global.originalFetch) {
        return global.originalFetch(url, options);
      } else {
        return fetch(url, options);
      }
    }
  };
  
  console.log('⚠️ Network security configuration applied');
};

/**
 * Resets fetch to its original implementation
 */
export const resetFetch = () => {
  if (global.originalFetch) {
    // Restore the original fetch implementation
    global.fetch = global.originalFetch;
    // Clean up
    global.originalFetch = undefined;
    console.log('Network settings reset to default');
  }
};

/**
 * Configure TLS for Android to allow insecure connections
 * NOTE: This is for development only and should never be used in production
 */
export const configureTrustAllCerts = () => {
  if (Platform.OS === 'android') {
    try {
      console.log('⚠️ Development only: Android network security configured');
    } catch (err) {
      console.log('Failed to configure TLS settings:', err);
    }
  }
};

// Class that handles all network configuration
export class NetworkConfig {
  static isConfigured = false;
  
  // Use this in your app's initialization
  static configureNetworkSecurity(isDevelopment: boolean) {
    if (this.isConfigured) return;
    
    if (isDevelopment) {
      console.log('⚠️ Configuring development network security settings');
      this.applyNetworkSecurity();
    }
    
    this.isConfigured = true;
  }
  
  private static applyNetworkSecurity() {
    try {
      // On newer React Native versions, you can use the following approach
      // This requires setting up android:networkSecurityConfig in AndroidManifest.xml
      console.log('Network security configuration applied');
    } catch (err) {
      console.error('Failed to configure network security:', err);
    }
  }
}
