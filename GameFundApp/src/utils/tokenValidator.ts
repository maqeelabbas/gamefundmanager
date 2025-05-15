// src/utils/tokenValidator.ts
import { getAuthToken } from '../services/http.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility to validate tokens and diagnose authentication issues
 */
export const tokenValidator = {
  /**
   * Validate token format
   */
  isValidTokenFormat: (token: string | null): boolean => {
    if (!token) return false;
    if (token.trim() === '') return false;
    
    // Check basic JWT format (three parts separated by dots)
    return token.includes('.') && token.split('.').length === 3;
  },
  
  /**
   * Log token diagnostic information
   */
  logTokenDiagnostics: async (): Promise<void> => {
    try {
      console.log('🔍 TOKEN DIAGNOSTICS REPORT:');
      
      // Check current in-memory token
      const currentToken = getAuthToken();
      console.log(`🔍 Current in-memory token: ${currentToken ? 'Present' : 'Not present'}`);
      if (currentToken) {
        console.log(`🔍 Token length: ${currentToken.length}`);
        console.log(`🔍 Token format valid: ${tokenValidator.isValidTokenFormat(currentToken)}`);
        console.log(`🔍 Token preview: ${currentToken.substring(0, 20)}...`);
      }
      
      // Check stored token
      const storedToken = await AsyncStorage.getItem('@GameFund:token');
      console.log(`🔍 AsyncStorage token: ${storedToken ? 'Present' : 'Not present'}`);
      if (storedToken) {
        console.log(`🔍 Stored token length: ${storedToken.length}`);
        console.log(`🔍 Stored token format valid: ${tokenValidator.isValidTokenFormat(storedToken)}`);
        console.log(`🔍 Stored token preview: ${storedToken.substring(0, 20)}...`);
      }
      
      // Check expiry information
      const expiryStr = await AsyncStorage.getItem('@GameFund:tokenExpiry');
      if (expiryStr) {
        try {
          const expiry = new Date(expiryStr);
          const now = new Date();
          const isExpired = expiry <= now;
          console.log(`🔍 Token expiry: ${expiryStr}`);
          console.log(`🔍 Token expired: ${isExpired ? 'Yes' : 'No'}`);
          if (!isExpired) {
            const timeLeft = expiry.getTime() - now.getTime();
            console.log(`🔍 Time left: ${Math.floor(timeLeft / 60000)} minutes`);
          }
        } catch (e) {
          console.error('🔍 Error parsing expiry date:', e);
        }
      } else {
        console.log('🔍 No token expiry information found');
      }
      
      // Check refresh state
      const refreshInProgress = await AsyncStorage.getItem('@GameFund:tokenRefreshInProgress');
      console.log(`🔍 Refresh in progress: ${refreshInProgress === 'true' ? 'Yes' : 'No'}`);
      
      const refreshLock = await AsyncStorage.getItem('@GameFund:tokenRefreshLock');
      console.log(`🔍 Refresh lock: ${refreshLock === 'true' ? 'Yes' : 'No'}`);
      
      const attemptsData = await AsyncStorage.getItem('@GameFund:tokenRefreshAttempts'); 
      if (attemptsData) {
        try {
          const attempts = JSON.parse(attemptsData);
          console.log(`🔍 Refresh attempts: ${attempts.count}`);
          console.log(`🔍 Last attempt: ${new Date(attempts.timestamp).toLocaleString()}`);
        } catch (e) {
          console.error('🔍 Error parsing refresh attempts:', e);
        }
      }
      
      console.log('🔍 END OF DIAGNOSTICS REPORT');
    } catch (error) {
      console.error('🔍 Error in token diagnostics:', error);
    }
  },
  
  /**
   * Clean up token state
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
