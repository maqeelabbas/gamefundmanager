// src/utils/authDebugger.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthToken } from '../services/http.service';

/**
 * Utility to help debug authentication issues
 */
export const authDebugger = {
  /**
   * Log authentication state for debugging purposes
   */
  logAuthState: async (): Promise<void> => {
    try {
      console.log('🔍 AUTH DEBUGGER REPORT:');
      
      // Check current in-memory token
      const currentToken = getAuthToken();
      console.log(`🔍 Current in-memory token: ${currentToken ? 'Present' : 'Not present'}`);
      if (currentToken) {
        console.log(`🔍 Token length: ${currentToken.length}`);
        console.log(`🔍 Token format valid: ${isValidTokenFormat(currentToken)}`);
        console.log(`🔍 Token preview: ${currentToken.substring(0, 20)}...`);
      }
      
      // Check stored token
      const storedToken = await AsyncStorage.getItem('@GameFund:token');
      console.log(`🔍 AsyncStorage token: ${storedToken ? 'Present' : 'Not present'}`);
      if (storedToken) {
        console.log(`🔍 Stored token length: ${storedToken.length}`);
        console.log(`🔍 Stored token format valid: ${isValidTokenFormat(storedToken)}`);
        console.log(`🔍 Stored token preview: ${storedToken.substring(0, 20)}...`);
      }
      
      // Check expiry information
      const expiryStr = await AsyncStorage.getItem('@GameFund:tokenExpiry');
      console.log(`🔍 Token expiry: ${expiryStr || 'Not set'}`);
      if (expiryStr) {
        try {
          const expiry = new Date(expiryStr);
          const now = new Date();
          const isExpired = expiry <= now;
          console.log(`🔍 Token expired: ${isExpired ? 'Yes' : 'No'}`);
          if (!isExpired) {
            const timeLeft = expiry.getTime() - now.getTime();
            console.log(`🔍 Time left: ${Math.floor(timeLeft / 60000)} minutes`);
          }
        } catch (e) {
          console.error('🔍 Error parsing expiry date:', e);
        }
      }
      
      // Check token refresh state
      const refreshInProgress = await AsyncStorage.getItem('@GameFund:tokenRefreshInProgress');
      console.log(`🔍 Refresh in progress: ${refreshInProgress === 'true' ? 'Yes' : 'No'}`);
      
      const refreshLock = await AsyncStorage.getItem('@GameFund:tokenRefreshLock');
      console.log(`🔍 Refresh lock active: ${refreshLock === 'true' ? 'Yes' : 'No'}`);
      
      // Check refresh attempts
      const attemptsData = await AsyncStorage.getItem('@GameFund:tokenRefreshAttempts');
      if (attemptsData) {
        try {
          const attempts = JSON.parse(attemptsData);
          console.log(`🔍 Refresh attempts: ${attempts.count}`);
          console.log(`🔍 Last attempt: ${new Date(attempts.timestamp).toLocaleTimeString()}`);
        } catch (e) {
          console.error('🔍 Error parsing refresh attempts:', e);
        }
      }
      
      console.log('🔍 END OF AUTH DEBUGGER REPORT');
    } catch (error) {
      console.error('Error in auth debugger:', error);
    }
  },

  /**
   * Reset token state by clearing locks and attempts
   */
  resetTokenState: async (): Promise<void> => {
    try {
      console.log('🔄 Resetting token state...');
      
      // Clear token refresh locks and counters
      await AsyncStorage.setItem('@GameFund:tokenRefreshInProgress', 'false');
      await AsyncStorage.setItem('@GameFund:tokenRefreshLock', 'false');
      await AsyncStorage.setItem('@GameFund:tokenRefreshAttempts', JSON.stringify({
        count: 0,
        timestamp: Date.now()
      }));
      
      console.log('✅ Token state reset complete');
    } catch (error) {
      console.error('❌ Error resetting token state:', error);
    }
  }
};

/**
 * Validate token format (basic check)
 */
function isValidTokenFormat(token: string): boolean {
  if (!token) return false;
  if (token.trim() === '') return false;
  
  // Check basic JWT format (three parts separated by dots)
  return token.includes('.') && token.split('.').length === 3;
}
