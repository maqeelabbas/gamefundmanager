// src/utils/authMonitor.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthToken, setAuthToken } from '../services/api.service';

// Constants
const AUTH_CHECK_INTERVAL = 60000; // 1 minute
const TOKEN_KEY = '@GameFund:token';
const TOKEN_EXPIRY_KEY = '@GameFund:tokenExpiry';

class AuthMonitor {
  private checkInterval: NodeJS.Timeout | null = null;
  
  /**
   * Start monitoring authentication state
   */
  startMonitoring(): void {
    // Clean up any existing monitor
    this.stopMonitoring();
    
    console.log('🔐 Starting auth monitor');
    
    // Set up periodic checks
    this.checkInterval = setInterval(() => {
      this.checkAuthState();
    }, AUTH_CHECK_INTERVAL);
    
    // Also check immediately
    this.checkAuthState();
  }
  
  /**
   * Stop monitoring authentication state
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('🔐 Auth monitor stopped');
    }
  }
  
  /**
   * Check if memory token matches storage token
   */
  private async checkAuthState(): Promise<void> {
    try {
      const memoryToken = getAuthToken();
      const storageToken = await AsyncStorage.getItem(TOKEN_KEY);
      
      if (!memoryToken && storageToken) {
        // Token exists in storage but not in memory - restore it
        console.log('🔐 Auth monitor: Restoring token from storage to memory');
        setAuthToken(storageToken);
      } else if (memoryToken && !storageToken) {
        // Token exists in memory but not in storage - save it
        console.log('🔐 Auth monitor: Saving token from memory to storage');
        await AsyncStorage.setItem(TOKEN_KEY, memoryToken);
      } else if (memoryToken !== storageToken && memoryToken && storageToken) {
        // Tokens are different - use the newer one
        console.log('🔐 Auth monitor: Token mismatch between memory and storage - synchronizing');
        setAuthToken(storageToken);
      }
      
      // Check token expiry
      await this.checkTokenExpiry();
    } catch (error) {
      console.error('🔐 Auth monitor error:', error);
    }
  }
  
  /**
   * Check if token is expired
   */
  private async checkTokenExpiry(): Promise<void> {
    try {
      const currentToken = getAuthToken();
      if (!currentToken) return;
      
      const expiryString = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);
      if (!expiryString) return;
      
      const expiry = new Date(expiryString);
      const now = new Date();
      
      // Is token expired or expiring soon (within 5 minutes)?
      if (now.getTime() > expiry.getTime() - 5 * 60 * 1000) {        console.log('🔐 Auth monitor: Token expired or expiring soon');
        
        // Trigger auth failure event using AsyncStorage as event bus
        AsyncStorage.setItem('@GameFund:authFailure', Date.now().toString())
          .then(() => console.log('Auth failure event triggered from auth monitor'))
          .catch(err => console.error('Failed to trigger auth failure event:', err));
      }
    } catch (error) {
      console.error('🔐 Auth monitor expiry check error:', error);
    }
  }
}

// Create and export a singleton instance
export const authMonitor = new AuthMonitor();
