// src/services/token.service.ts
import { api, getAuthToken, setAuthToken } from './api.service';
import { API_CONFIG, ApiResponse } from '../config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for AsyncStorage
const TOKEN_KEY = '@GameFund:token';
const TOKEN_EXPIRY_KEY = '@GameFund:tokenExpiry';

// Interface for token refreshing
interface TokenRefreshResponse {
  token: string;
  tokenExpires: string;
}

class TokenService {  // Check if token is expired or will expire soon
  async isTokenExpired(): Promise<boolean> {
    try {
      const tokenExpiryStr = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);
      const currentToken = getAuthToken();
      
      // Track if we've checked recently to avoid excessive checks
      const lastCheckStr = await AsyncStorage.getItem('@GameFund:lastExpiryCheck');
      const now = new Date();
      
      if (lastCheckStr) {
        const lastCheck = new Date(lastCheckStr);
        const timeSinceLastCheck = now.getTime() - lastCheck.getTime();
        
        // If we checked within the last minute and it was valid, don't check again
        if (timeSinceLastCheck < 60000) { // 1 minute
          const lastResult = await AsyncStorage.getItem('@GameFund:lastExpiryResult');
          if (lastResult === 'valid') {
            console.log('🔑 Token was checked recently and was valid');
            return false;
          }
        }
      }
      
      // Record this check time
      await AsyncStorage.setItem('@GameFund:lastExpiryCheck', now.toISOString());
      
      if (!tokenExpiryStr) {
        console.log('🔑 No token expiry information found');
        
        // Check if we have a current token - if so, set a default expiry time
        if (currentToken) {
          // Create an expiry date 24 hours from now as a fallback
          const defaultExpiry = new Date();
          defaultExpiry.setHours(defaultExpiry.getHours() + 24);
          
          console.log(`🔑 Setting default token expiry to: ${defaultExpiry.toISOString()}`);
          await this.saveTokenExpiry(defaultExpiry);
          
          // Token is considered valid with our default expiry
          await AsyncStorage.setItem('@GameFund:lastExpiryResult', 'valid');
          return false;
        }
        
        await AsyncStorage.setItem('@GameFund:lastExpiryResult', 'expired');
        return true; // No token expiry and no current token, treat as expired
      }
      
      try {
        const tokenExpiry = new Date(tokenExpiryStr);
        
        // Check if the expiry date is valid
        if (isNaN(tokenExpiry.getTime())) {
          console.error('🔑 Invalid token expiry date format:', tokenExpiryStr);
          
          // Create a new default expiry
          const defaultExpiry = new Date();
          defaultExpiry.setHours(defaultExpiry.getHours() + 12);
          await this.saveTokenExpiry(defaultExpiry);
          
          await AsyncStorage.setItem('@GameFund:lastExpiryResult', 'valid');
          return false;
        }
        
        // Add a buffer to handle refresh before actual expiration
        // Scale the buffer based on token lifetime to be 10% of total time or 5 minutes, whichever is less
        const tokenLifespan = tokenExpiry.getTime() - now.getTime();
        const expiryBuffer = Math.min(tokenLifespan * 0.1, 5 * 60 * 1000); // 5 minutes max
        const willExpireSoon = tokenLifespan < expiryBuffer;
        
        if (willExpireSoon) {
          console.log('🔑 Token will expire soon or has expired already');
          console.log(`🔑 Token expires: ${tokenExpiry.toISOString()}, Current time: ${now.toISOString()}`);
          await AsyncStorage.setItem('@GameFund:lastExpiryResult', 'expired');
        } else {
          await AsyncStorage.setItem('@GameFund:lastExpiryResult', 'valid');
        }
        
        return willExpireSoon;
      } catch (parseError) {
        console.error('🔑 Error parsing token expiry date:', parseError);
        
        // Create a new default expiry if the date is unparseable
        const defaultExpiry = new Date();
        defaultExpiry.setHours(defaultExpiry.getHours() + 12);
        await this.saveTokenExpiry(defaultExpiry);
        
        await AsyncStorage.setItem('@GameFund:lastExpiryResult', 'valid');
        return false;
      }
    } catch (error) {
      console.error('🔑 Error checking token expiration:', error);
      
      // If we can't determine expiry, we'll set a default expiry
      // but still treat it as expired for safety to trigger a refresh
      const defaultExpiry = new Date();
      defaultExpiry.setHours(defaultExpiry.getHours() + 6);
      await this.saveTokenExpiry(defaultExpiry);
      
      await AsyncStorage.setItem('@GameFund:lastExpiryResult', 'expired');
      return true;
    }
  }

  // Save token expiry time to AsyncStorage
  async saveTokenExpiry(expiryDate: Date | string): Promise<void> {
    try {
      const expiryString = typeof expiryDate === 'string' ? expiryDate : expiryDate.toISOString();
      await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryString);
      console.log(`🔑 Token expiry saved: ${expiryString}`);
    } catch (error) {
      console.error('🔑 Error saving token expiry:', error);
    }
  }  // Refresh the auth token
  async refreshToken(): Promise<boolean> {
    try {
      // First check if refresh is in progress by another request
      const refreshInProgress = await AsyncStorage.getItem('@GameFund:tokenRefreshInProgress');
      if (refreshInProgress === 'true') {
        console.log('🔑 Another refresh operation is in progress, waiting...');
        
        // Wait for a short time to see if the other refresh completes
        return new Promise((resolve) => {
          const checkInterval = setInterval(async () => {
            const stillInProgress = await AsyncStorage.getItem('@GameFund:tokenRefreshInProgress');
            if (stillInProgress !== 'true') {
              clearInterval(checkInterval);
              console.log('🔑 Using token that was refreshed by another request');
              resolve(true);
            }
          }, 500);
          
          // Safety timeout after 5 seconds to prevent deadlock
          setTimeout(() => {
            clearInterval(checkInterval);
            console.log('🔑 Timed out waiting for other refresh, proceeding with current token');
            resolve(true);
          }, 5000);
        });
      }
      
      const currentToken = getAuthToken();
      
      if (!currentToken) {
        console.error('🔑 No token available to refresh');
        return false;
      }
      
      console.log('🔑 Attempting to refresh token');
      
      // Set flag indicating refresh is in progress
      await AsyncStorage.setItem('@GameFund:tokenRefreshInProgress', 'true');
      
      // Counter to prevent continuous refresh attempts with exponential backoff
      const refreshCountData = await AsyncStorage.getItem('@GameFund:tokenRefreshAttempts') || '{"count":0,"timestamp":0}';
      let attempts;
      let lastAttemptTime;
      
      try {
        const parsedData = JSON.parse(refreshCountData);
        attempts = parsedData.count;
        lastAttemptTime = parsedData.timestamp;
      } catch (e) {
        // Handle legacy format or parsing error
        attempts = parseInt(refreshCountData, 10) || 0;
        lastAttemptTime = 0;
      }
      
      const now = Date.now();
      const timeSinceLastAttempt = now - lastAttemptTime;
      
      // Calculate backoff time based on attempts (exponential backoff with jitter)
      const backoffTime = attempts > 0 ? Math.min(
        60000 * Math.pow(2, attempts - 1) + Math.floor(Math.random() * 5000),
        3600000 // Max 1 hour backoff
      ) : 0;
      
      // If we've already tried recently, respect the backoff period
      if (attempts > 0 && timeSinceLastAttempt < backoffTime) {
        console.log(`🔑 Respecting backoff period. Next refresh allowed in ${Math.ceil((backoffTime - timeSinceLastAttempt)/1000)} seconds`);
        
        // Set a longer temporary expiry based on backoff time
        const defaultExpiry = new Date();
        defaultExpiry.setTime(now + backoffTime + 60000); // Backoff time + 1 minute
        await this.saveTokenExpiry(defaultExpiry);
        
        // Clear in-progress flag
        await AsyncStorage.setItem('@GameFund:tokenRefreshInProgress', 'false');
        
        return true; // Use current token and respect backoff
      }
      
      // If too many attempts overall, set a much longer expiry to prevent continuous attempts
      if (attempts > 5) {
        console.log('🔑 Too many refresh attempts overall, using current token for extended period');
        
        // Set a temporary long expiry
        const defaultExpiry = new Date();
        defaultExpiry.setHours(defaultExpiry.getHours() + Math.min(attempts, 24)); // Up to 24 hours
        await this.saveTokenExpiry(defaultExpiry);
        
        // Reset the counter after a longer period based on attempts
        setTimeout(async () => {
          await AsyncStorage.setItem('@GameFund:tokenRefreshAttempts', JSON.stringify({
            count: Math.max(0, attempts - 1),
            timestamp: Date.now()
          }));
        }, 3600000); // 1 hour
        
        // Clear in-progress flag
        await AsyncStorage.setItem('@GameFund:tokenRefreshInProgress', 'false');
        
        return true;
      }
      
      // Update attempts counter with count and timestamp
      await AsyncStorage.setItem('@GameFund:tokenRefreshAttempts', JSON.stringify({
        count: attempts + 1,
        timestamp: now
      }));
      
      try {
        // Call the backend refresh token endpoint
        const response = await api.post<ApiResponse<TokenRefreshResponse>>('/auth/refresh-token', {
          token: currentToken
        });
        
        if (response.data && response.data.token) {
          // Update token in memory and storage
          setAuthToken(response.data.token);
          await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
          
          // Save expiry information
          await this.saveTokenExpiry(response.data.tokenExpires);
          
          // Reset attempts counter on success
          await AsyncStorage.setItem('@GameFund:tokenRefreshAttempts', JSON.stringify({
            count: 0,
            timestamp: now
          }));
          
          console.log('🔑 Token refreshed successfully');
          
          // Clear in-progress flag
          await AsyncStorage.setItem('@GameFund:tokenRefreshInProgress', 'false');
          
          return true;
        } else {
          console.error('🔑 Failed to refresh token:', response.message || 'Unknown error');
          
          // Handle token refresh failure - set a default expiry with backoff
          const defaultExpiry = new Date();
          const backoffHours = Math.min(1 * Math.pow(2, attempts), 24); // Exponential backoff, max 24 hours
          defaultExpiry.setHours(defaultExpiry.getHours() + backoffHours);
          await this.saveTokenExpiry(defaultExpiry);
          
          // Clear in-progress flag
          await AsyncStorage.setItem('@GameFund:tokenRefreshInProgress', 'false');
          
          return true; // Continue using the current token temporarily
        }
      } catch (error: any) {
        console.error('🔑 Token refresh error:', error);
        
        // Check if we received a 401 Unauthorized response
        const isAuthError = error.response?.status === 401;
        
        if (isAuthError) {
          console.log('🔑 Token is invalid or cannot be refreshed');
          
          // Clear in-progress flag
          await AsyncStorage.setItem('@GameFund:tokenRefreshInProgress', 'false');
          
          return false; // Signal that the token is invalid
        }
        
        console.log('🔑 Network or server error during token refresh');
        
        // Set a temporary default expiry with exponential backoff
        const defaultExpiry = new Date();
        const backoffHours = Math.min(6 * Math.pow(2, attempts - 1), 48); // More aggressive backoff for errors
        defaultExpiry.setHours(defaultExpiry.getHours() + backoffHours);
        await this.saveTokenExpiry(defaultExpiry);
        
        // Clear in-progress flag
        await AsyncStorage.setItem('@GameFund:tokenRefreshInProgress', 'false');
        
        return true; // Return true to continue using the current token
      }
    } catch (error) {
      console.error('🔑 Token refresh error:', error);
      
      // Make sure to clear the in-progress flag even if an error occurs
      await AsyncStorage.setItem('@GameFund:tokenRefreshInProgress', 'false');
      
      return false;
    }
  }  // Validate and refresh token if needed before making API calls
  async ensureValidToken(): Promise<boolean> {
    // We'll use this to store the lock release function
    let lockReleased = false;
    
    try {
      const currentToken = getAuthToken();
      
      // If no token, nothing to refresh
      if (!currentToken) {
        console.log('🔑 No token found to validate');
        return false;
      }
      
      // Check if we've validated the token recently (within 30 seconds)
      // This prevents redundant checks in rapid succession
      const lastValidated = await AsyncStorage.getItem('@GameFund:lastTokenValidation');
      if (lastValidated) {
        const lastValidationTime = parseInt(lastValidated, 10);
        const now = Date.now();
        
        if (now - lastValidationTime < 30000) { // 30 seconds
          console.log('🔑 Token was validated recently, skipping check');
          return true;
        }
      }
      
      // Only check expiry and perform refresh if there's no ongoing operation
      const acquireLock = async (): Promise<boolean> => {
        // Use atomic operation if possible (not truly atomic in React Native but better than nothing)
        const refreshLock = await AsyncStorage.getItem('@GameFund:tokenRefreshLock');
        if (refreshLock === 'true') {
          return false;
        }
        
        await AsyncStorage.setItem('@GameFund:tokenRefreshLock', 'true');
        return true;
      };
      
      // Try to acquire lock with timeout
      let lockAcquired = await acquireLock();
      let attempts = 0;
      
      // If we couldn't get the lock, we'll wait a bit and try again a few times
      while (!lockAcquired && attempts < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        lockAcquired = await acquireLock();
        attempts++;
      }
      
      if (!lockAcquired) {
        console.log('🔑 Could not acquire lock after multiple attempts, using current token');
        return true;
      }
      
      // Function to release lock safely
      const releaseLock = async () => {
        if (!lockReleased) {
          await AsyncStorage.setItem('@GameFund:tokenRefreshLock', 'false');
          lockReleased = true;
        }
      };
      
      // Safety measure: schedule lock release in any case after 15 seconds
      const safetyClearTimeout = setTimeout(async () => {
        await releaseLock();
      }, 15000);
      
      try {
        // Record validation time
        await AsyncStorage.setItem('@GameFund:lastTokenValidation', Date.now().toString());
        
        // Check if token is expired
        const isExpired = await this.isTokenExpired();
        
        if (isExpired) {
          console.log('🔑 Token expired or will expire soon, refreshing...');
          const refreshed = await this.refreshToken();
          
          await releaseLock(); // Release lock after refresh attempt
          clearTimeout(safetyClearTimeout);
          
          if (!refreshed) {
            // Even if refresh fails, we'll still use the current token
            // Set a temporary expiry to prevent continuous refresh attempts
            const defaultExpiry = new Date();
            defaultExpiry.setHours(defaultExpiry.getHours() + 6);
            await this.saveTokenExpiry(defaultExpiry);
            console.log('🔑 Using existing token with temporary expiry');
            return true;
          }
          
          return refreshed;
        }
        
        await releaseLock(); // Release lock when done
        clearTimeout(safetyClearTimeout);
        
        console.log('🔑 Token is valid');
        return true;
      } catch (error) {
        // Release lock on error and rethrow
        await releaseLock();
        clearTimeout(safetyClearTimeout);
        throw error;
      }
    } catch (error) {
      console.error('🔑 Error validating token:', error);
      
      // Make sure lock is released
      if (!lockReleased) {
        await AsyncStorage.setItem('@GameFund:tokenRefreshLock', 'false');
      }
      
      // Even on error, if we have a token, consider it valid to prevent app from being unusable
      return !!getAuthToken();
    }
  }

  // Clear token expiry information
  async clearTokenInfo(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_EXPIRY_KEY);
      console.log('🔑 Token expiry information cleared');
    } catch (error) {
      console.error('🔑 Error clearing token expiry information:', error);
    }
  }
}

export const tokenService = new TokenService();
