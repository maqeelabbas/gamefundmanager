// src/services/http.service.ts
import { API_CONFIG } from '../config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for API calls
const API_BASE_URL = API_CONFIG.BASE_URL;

// Store the auth token
let authToken: string | null = null;
export let tokenInitialized = false;

// Initialize token from AsyncStorage
export const initializeAuthToken = async (): Promise<void> => {
  try {
    console.log('🔑 Initializing auth token from storage');
    const storedToken = await AsyncStorage.getItem('@GameFund:token');
    if (storedToken) {
      // Validate token format
      if (storedToken.split('.').length !== 3) {
        console.error('🔑 Invalid token format detected during initialization');
        authToken = null;
      } else {
        console.log(`🔑 Found stored token: ${storedToken.substring(0, 15)}...`);
        authToken = storedToken;
      }
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
      // Initialize token immediately (this won't actually be synchronous but will start the process)
      initializeAuthToken().catch(e => console.error('Async token initialization failed:', e));
      
      // Check if token is already loaded from AsyncStorage synchronously
      // This is a fallback mechanism for when the token is accessed before initialization
      AsyncStorage.getItem('@GameFund:token')
        .then(token => {
          if (token && !authToken) {
            console.log('🔑 Retrieved token from AsyncStorage synchronously');
            authToken = token;
            tokenInitialized = true;
          }
        })
        .catch(e => console.error('Failed to get token from AsyncStorage:', e));
    } catch (e) {
      console.error('Failed to initialize token:', e);
    }
  }
  
  if (authToken) {
    console.log(`🔑 Current auth token: ${authToken.substring(0, 15)}... (${authToken.length} chars)`);
  } else {
    console.log('🔑 Current token state: null');
  }
  return authToken;
};

// Create default headers for API requests
const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  const token = authToken;
  if (token) {
    try {
      // First make sure token is not undefined, null, or empty
      if (!token || token.trim() === '') {
        console.log('🔑 Empty token found in getHeaders, skipping Authorization header');
        return headers;
      }
      
      // Basic JWT format validation 
      if (!token.includes('.') || token.split('.').length !== 3) {
        console.error('🔑 Invalid token format detected in getHeaders, skipping Authorization header');
        return headers;
      }
      
      // Make sure token is formatted correctly with 'Bearer' prefix
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7).trim() : token;
      headers['Authorization'] = `Bearer ${cleanToken}`;
      console.log('🔑 Adding Authorization header:', `Bearer ${cleanToken.substring(0, 15)}...`);
    } catch (e) {
      console.error('🔑 Error setting Authorization header:', e);
    }
  } else {
    console.log('🔑 No auth token available for request headers');
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
