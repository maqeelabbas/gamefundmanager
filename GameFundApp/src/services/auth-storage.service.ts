// src/services/auth-storage.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for AsyncStorage
export const TOKEN_KEY = '@GameFund:token';
export const TOKEN_EXPIRY_KEY = '@GameFund:tokenExpiry';

// Store the auth token in memory for quick access
let memoryToken: string | null = null;

// Get token from memory or AsyncStorage
export const getAuthToken = async (): Promise<string | null> => {
  // If we have a token in memory, return it
  if (memoryToken) {
    return memoryToken;
  }
  
  // Otherwise try to load it from storage
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      memoryToken = token;
      console.log('🔑 Loaded token from storage');
    }
    return token;
  } catch (error) {
    console.error('Error getting token from storage:', error);
    return null;
  }
};

// Get token synchronously (may return null if not in memory yet)
export const getAuthTokenSync = (): string | null => {
  return memoryToken;
};

// Set token in memory and storage
export const setAuthToken = async (token: string | null): Promise<void> => {
  console.log(`🔑 ${token ? 'Setting' : 'Clearing'} auth token: ${token ? `${token.substring(0, 15)}...` : 'null'}`);
  
  // Update memory
  memoryToken = token;
  
  // Update storage
  try {
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error setting token in storage:', error);
  }
};

// Save token expiry time to storage
export const saveTokenExpiry = async (expiryDate: Date | string): Promise<void> => {
  try {
    const expiryString = typeof expiryDate === 'string' ? expiryDate : expiryDate.toISOString();
    await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryString);
    console.log(`🔑 Token expiry saved: ${expiryString}`);
  } catch (error) {
    console.error('Error saving token expiry:', error);
  }
};

// Get token expiry from storage
export const getTokenExpiry = async (): Promise<Date | null> => {
  try {
    const expiryString = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryString) {
      return null;
    }
    
    return new Date(expiryString);
  } catch (error) {
    console.error('Error getting token expiry:', error);
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = async (): Promise<boolean> => {
  try {
    const expiry = await getTokenExpiry();
    if (!expiry) {
      // No expiry date, assume expired
      return true;
    }
    
    // Add buffer to ensure we refresh before actual expiration
    const now = new Date();
    const bufferMs = 5 * 60 * 1000; // 5 minutes
    
    return expiry.getTime() - bufferMs < now.getTime();
  } catch (error) {
    console.error('Error checking if token is expired:', error);
    return true; // Assume expired on error
  }
};

// Clear all auth data
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(TOKEN_EXPIRY_KEY);
    memoryToken = null;
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};
