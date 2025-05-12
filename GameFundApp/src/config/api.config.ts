import { Platform } from 'react-native';

// API configuration
export const API_CONFIG = {
  // Dynamically set the BASE_URL based on platform
  // For iOS simulator, use 'localhost'
  // For Android emulator, use '10.0.2.2'
  // For physical devices, use the computer's local network IP
  
  // IMPORTANT: Using HTTP instead of HTTPS to avoid certificate validation issues in development
  BASE_URL: Platform.select({
    ios: 'https://cdf6-2001-a62-4d8-d101-b5bc-c9ca-6059-a4da.ngrok-free.app/api', // Use localhost for iOS simulator
    android: 'https://cdf6-2001-a62-4d8-d101-b5bc-c9ca-6059-a4da.ngrok-free.app/api', // Special IP for Android emulator
    default: 'https://cdf6-2001-a62-4d8-d101-b5bc-c9ca-6059-a4da.ngrok-free.app/api', // Fallback to local network IP
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