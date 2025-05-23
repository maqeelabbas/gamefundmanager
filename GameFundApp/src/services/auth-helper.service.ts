// New temporary auth service to break circular dependency
// src/services/auth-helper.service.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Keys for AsyncStorage
const TOKEN_KEY = '@GameFund:token';
const TOKEN_EXPIRY_KEY = '@GameFund:tokenExpiry';

// Create a native-friendly event system since we can't use document events in React Native
class EventEmitter {
  private listeners: Record<string, Function[]> = {};

  on(event: string, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.listeners[event]) return;
    for (const callback of this.listeners[event]) {
      callback(...args);
    }
  }
}

export const authEvents = new EventEmitter();

// Direct fetch function for authentication without circular deps
export const authFetch = async <T>(
  url: string,
  method: string = 'GET',
  body?: any,
  headers?: Record<string, string>
): Promise<T> => {
  // Get token
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  // Set up headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  };

  // Add token if we have one
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }
  // Set up request options
  const options: RequestInit = {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined
  };

  // URLs are now directly configured for HTTP in api.config.ts
  let processedUrl = url;

  // Make the request
  console.log(`🌐 Auth fetch:`, method, processedUrl);
  const response = await fetch(processedUrl, options);
  console.log('✅ Auth fetch completed with status:', response.status);

  // Parse response
  const text = await response.text();
  let data: T;
  
  try {
    data = JSON.parse(text) as T;
  } catch (e) {
    console.error('❌ Failed to parse response as JSON:', text);
    throw new Error('Invalid JSON response');
  }
  
  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }
  
  return data;
};

// Simple function to check authentication is working
export const validateToken = async (apiBaseUrl: string): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) {
      console.log('🔑 No token to validate');
      return false;
    }
    
    // Make a direct request to healthcheck endpoint
    const url = `${apiBaseUrl}/auth/healthcheck`;
    await authFetch(url);
    
    console.log('🔑 Token validated successfully');
    return true;
  } catch (error) {
    console.error('🔑 Token validation failed:', error);
    return false;
  }
};

// Function to refresh the token
export const refreshToken = async (apiBaseUrl: string): Promise<boolean> => {
  try {
    const currentToken = await AsyncStorage.getItem(TOKEN_KEY);
    if (!currentToken) {
      console.log('🔑 No token to refresh');
      return false;
    }
    
    console.log('🔑 Attempting to refresh token');
    
    // Make direct request to refresh endpoint
    const url = `${apiBaseUrl}/auth/refresh-token`;
    const response = await authFetch<{
      success: boolean;
      data: {
        token: string;
        tokenExpires: string;
      }
    }>(url, 'POST', { token: currentToken });
    
    if (response.success && response.data.token) {
      // Save the new token
      await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
      await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, response.data.tokenExpires);
      
      console.log('🔑 Token refreshed successfully');
      return true;
    } else {
      console.error('🔑 Token refresh failed');
      return false;
    }
  } catch (error) {
    console.error('🔑 Token refresh error:', error);
    return false;
  }
};

// Function to emit auth failure events
export const emitAuthFailure = () => {
  console.log('🔑 Emitting auth failure event');
  
  // Use our custom event emitter
  authEvents.emit('authFailure');
  
  // Also store in AsyncStorage for components that might be checking it
  AsyncStorage.setItem('@GameFund:authFailure', Date.now().toString());
};
