import { Platform } from 'react-native';

// API configuration
export const API_CONFIG = {
  // Dynamically set the BASE_URL based on platform
  // For iOS simulator, use 'localhost'
  // For Android emulator, use '10.0.2.2'
  // For physical devices, use the computer's local network IP
  // Using HTTP for development to avoid certificate validation issues
  BASE_URL: Platform.select({
    ios: 'https://gamefundapi.vicbts.com/api', // Use localhost for iOS simulator
    android: 'https://gamefundapi.vicbts.com/api', // Special IP for Android emulator
    default: 'https://gamefundapi.vicbts.com/api', // Fallback to local network IP
  }),
  
  // Alternative configurations (uncomment and modify as needed):
  
  // Option: Use hostname (if your device can resolve the hostname)
  // BASE_URL: 'http://epmauh-aqeel:8085/api',

  // Option: Use your computer's local network IP for physical devices
  // Find your IP with 'ipconfig' in Windows or 'ifconfig' in macOS/Linux
  // Example: 'http://192.168.1.5:8085/api'
    // Network request configuration
  TIMEOUT: 15000, // Extended timeout for slower connections (15 seconds)
  CREDENTIALS: 'include' as RequestCredentials, // Include credentials for CORS
  // This allows physical devices on the same network to connect
  // BASE_URL: 'http://192.168.X.X:8085/api', // Replace with your actual local IP
};

// Common API response structure
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[] | null;
}