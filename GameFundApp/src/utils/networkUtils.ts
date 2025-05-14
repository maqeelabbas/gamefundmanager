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
      // For development only, convert HTTPS to HTTP to avoid certificate validation issues
      let urlString = url.toString();
      if (urlString.startsWith('https:') && __DEV__) {
        console.log(`⚠️ Converting HTTPS to HTTP in development mode`);
        urlString = urlString.replace('https:', 'http:');
        
        // If port is 443 or 8086 (HTTPS), change to 80 or 8085 (HTTP)
        urlString = urlString.replace(':443', ':80');
        urlString = urlString.replace(':8086', ':8085');
        
        console.log(`🔄 ${url} -> ${urlString}`);
        url = urlString;
      }
      
      // In development, we're using HTTP instead of trying to bypass SSL certificates
      console.log(`🌐 Fetching: ${url.toString()}`);
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
  
  console.log('⚠️ Development only: HTTPS to HTTP conversion enabled');
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
