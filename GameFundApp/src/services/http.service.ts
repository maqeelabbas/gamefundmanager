// src/services/http.service.ts
import { API_CONFIG } from '../config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for API calls
const API_BASE_URL = API_CONFIG.BASE_URL;

// Store the auth token
let authToken: string | null = null;
let tokenInitialized = false;

// Initialize token from AsyncStorage
export const initializeAuthToken = async (): Promise<void> => {
  try {
    console.log('🔑 Initializing auth token from storage');
    const storedToken = await AsyncStorage.getItem('@GameFund:token');
    if (storedToken) {
      console.log(`🔑 Found stored token: ${storedToken.substring(0, 15)}...`);
      authToken = storedToken;
    } else {
      console.log('🔑 No stored token found');
      authToken = null;
    }
    tokenInitialized = true;
  } catch (err) {
    console.error('Error initializing token from AsyncStorage:', err);
    authToken = null;
    tokenInitialized = true;
  }
};

// Set the auth token for API calls
export const setAuthToken = (token: string | null) => {
  console.log(`🔑 ${token ? 'Setting' : 'Clearing'} auth token: ${token ? `${token.substring(0, 15)}...` : 'null'}`);
  authToken = token;
  tokenInitialized = true;
  
  // Also update AsyncStorage for persistence across app restarts
  if (token) {
    AsyncStorage.setItem('@GameFund:token', token).catch(err => 
      console.error('Error saving token to AsyncStorage:', err)
    );
  } else {
    AsyncStorage.removeItem('@GameFund:token').catch(err => 
      console.error('Error removing token from AsyncStorage:', err)
    );
  }
};

// Get the current auth token
export const getAuthToken = () => {
  if (!tokenInitialized) {
    console.warn('🔑 Warning: Token accessed before initialization, attempting immediate load');
    // Try to get it synchronously if possible
    try {
      initializeAuthToken();
    } catch (e) {
      console.error('Failed to initialize token:', e);
    }
  }
  
  console.log(`🔑 Current auth token: ${authToken ? `${authToken.substring(0, 15)}... (${authToken.length} chars)` : 'null'}`);
  return authToken;
};

// Create default headers for API requests
const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return headers;
};

// Basic fetch function to make HTTP requests
export const httpFetch = async <T>(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  customHeaders?: Record<string, string>
): Promise<T> => {
  // Ensure the endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  console.log(`🚀 API REQUEST: ${method} ${url}`);
  
  // Configuring network requests
  const options: RequestInit = {
    method,
    headers: {
      ...getHeaders(),
      ...(customHeaders || {}),
    },
    mode: 'cors',
    cache: 'no-cache',
    credentials: API_CONFIG.CREDENTIALS,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
    console.log('📦 Request Body:', JSON.stringify(body, null, 2));
  }
  
  // Set up AbortController for timeout handling
  const controller = new AbortController();
  options.signal = controller.signal;
  
  // Set timeout
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.log('⏱️ Request timed out after', API_CONFIG.TIMEOUT, 'ms');
  }, API_CONFIG.TIMEOUT);
  
  try {
    // Convert HTTPS to HTTP in dev mode if needed
    let processedUrl = url;
    if (__DEV__ && processedUrl.startsWith('https://')) {
      console.log('⚠️ Converting HTTPS to HTTP in development mode');
      processedUrl = processedUrl.replace('https://', 'http://');
      console.log('🔄', url, '->', processedUrl);
    }
    
    console.log('🌐 Fetching:', processedUrl);
    const response = await fetch(processedUrl, options);
    clearTimeout(timeoutId); // Clear timeout on success
    
    console.log('✅ Fetch completed with status:', response.status);
    console.log('📄 Response headers:', JSON.stringify(Object.fromEntries([...response.headers.entries()]), null, 2));
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`❌ API Error (${response.status}):`, responseText || 'No error text');
      throw new Error(responseText || `API call failed with status: ${response.status}`);
    }
    
    let result;
    try {
      result = JSON.parse(responseText);
      console.log('✅ API Response:', JSON.stringify(result, null, 2));
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      throw new Error('Invalid JSON response from server');
    }
    
    return result as T;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`❌ API ${method} ${endpoint} error:`, error);
    throw error;
  }
};
