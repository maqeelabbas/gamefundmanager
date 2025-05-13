// src/services/api.service.ts
import { API_CONFIG, ApiResponse } from '../config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, getAuthToken } from './http.service';
import { tokenService } from './token.service';

// Re-export the token functions from http service
export { setAuthToken, getAuthToken };

// Import API base URL
const API_BASE_URL = API_CONFIG.BASE_URL;

// Create default headers for API requests
const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Track API calls to prevent infinite loops - separate counters by endpoint type
const apiCallCounters = {
  auth: 0,
  refresh: 0,
  other: 0,
  total: 0
};

const MAX_API_CALLS = {
  auth: 10,    // Max 10 auth calls in reset interval
  refresh: 5,  // Max 5 token refresh calls in reset interval
  other: 30,   // Max 30 regular API calls in reset interval
  total: 50    // Max 50 total calls in reset interval
};

const API_CALL_RESET_INTERVAL = 10000; // 10 seconds

// Track API calls per endpoint to identify problematic endpoints
const endpointCounters = new Map<string, number>();

// Reset API call counters periodically
setInterval(() => {
  if (apiCallCounters.total > 0) {
    console.log(`🔄 Resetting API call counters: Auth: ${apiCallCounters.auth}, Refresh: ${apiCallCounters.refresh}, Other: ${apiCallCounters.other}, Total: ${apiCallCounters.total}`);
    
    // If we hit any limits, log details about which endpoints were called most
    if (apiCallCounters.total >= MAX_API_CALLS.total ||
        apiCallCounters.auth >= MAX_API_CALLS.auth ||
        apiCallCounters.refresh >= MAX_API_CALLS.refresh ||
        apiCallCounters.other >= MAX_API_CALLS.other) {
      
      console.error('⚠️ API call limits reached, potential issues with these endpoints:');
      // Sort endpoints by call count and log the top 5
      const sortedEndpoints = [...endpointCounters.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      sortedEndpoints.forEach(([endpoint, count]) => {
        console.error(`⚠️ ${endpoint}: ${count} calls`);
      });
    }
    
    // Reset all counters
    apiCallCounters.auth = 0;
    apiCallCounters.refresh = 0;
    apiCallCounters.other = 0;
    apiCallCounters.total = 0;
    endpointCounters.clear();
  }
}, API_CALL_RESET_INTERVAL);

// Track retry attempts for failed requests
const retryCounters = new Map<string, number>();

// Generic API call function with improved safety mechanisms
const apiCall = async <T>(
  endpoint: string,
  method: string = 'GET',
  data?: any,
  customHeaders?: Record<string, string>,
  isRetry: boolean = false
): Promise<T> => {
  try {
    // Determine endpoint type for counter categorization
    let endpointType = 'other';
    if (endpoint.includes('/auth/login') || endpoint.includes('/auth/register')) {
      endpointType = 'auth';
    } else if (endpoint.includes('/auth/refresh-token')) {
      endpointType = 'refresh';
    }
    
    // Increment counters
    apiCallCounters[endpointType as keyof typeof apiCallCounters]++;
    apiCallCounters.total++;
    
    // Track per-endpoint counts
    const endpointKey = `${method}:${endpoint}`;
    endpointCounters.set(endpointKey, (endpointCounters.get(endpointKey) || 0) + 1);
    
    // Check for potential infinite loops or excessive calls by endpoint type
    if (apiCallCounters[endpointType as keyof typeof apiCallCounters] > MAX_API_CALLS[endpointType as keyof typeof MAX_API_CALLS]) {
      console.error(`⚠️ Too many ${endpointType} API calls (${apiCallCounters[endpointType as keyof typeof apiCallCounters]}) in a short period!`);
      
      // For refresh token calls, implement a circuit breaker pattern
      if (endpointType === 'refresh') {
        console.error('🛑 Token refresh circuit breaker activated! Skipping further refresh attempts for 5 minutes');
        
        // Set a long expiry to prevent further refresh attempts
        const defaultExpiry = new Date();
        defaultExpiry.setMinutes(defaultExpiry.getMinutes() + 5);
        await tokenService.saveTokenExpiry(defaultExpiry);
        
        // Clear any locks that might be in place
        await AsyncStorage.setItem('@GameFund:tokenRefreshLock', 'false');
        await AsyncStorage.setItem('@GameFund:tokenRefreshInProgress', 'false');
        
        throw new Error('Token refresh circuit breaker activated. Too many refresh attempts.');
      }
      
      // For other calls, throw error but allow app to continue working
      if (apiCallCounters.total > MAX_API_CALLS.total) {
        throw new Error(`API call limit exceeded. Too many ${endpointType} requests (${apiCallCounters[endpointType as keyof typeof apiCallCounters]}/${MAX_API_CALLS[endpointType as keyof typeof MAX_API_CALLS]}).`);
      }
    }
      // Skip token validation for auth endpoints
    const isAuthEndpoint = endpoint.includes('/auth/login') || 
                           endpoint.includes('/auth/register') ||
                           endpoint.includes('/auth/healthcheck') ||
                           endpoint.includes('/auth/refresh-token');
    
    // For authenticated endpoints, validate token first
    let currentToken = getAuthToken();
    
    // First, ensure we have a token loaded from storage
    if (!currentToken && !isAuthEndpoint) {
      try {
        // This might be a cold start where token hasn't been initialized yet
        const storedToken = await AsyncStorage.getItem('@GameFund:token');
        if (storedToken) {
          console.log('🔑 Found stored token, setting it before request');
          setAuthToken(storedToken);
          currentToken = storedToken;
        } else {
          console.log('🔑 No valid token available for request');
        }
      } catch (error) {
        console.error('Error retrieving stored token:', error);
      }
    }
    
    if (currentToken && !isAuthEndpoint && !isRetry) {
      try {
        // Check if token needs refreshing and refresh if needed
        // But only do this for original requests, not for retries to prevent loops
        console.log('🔑 Ensuring token is valid before request');
        await tokenService.ensureValidToken();
      } catch (tokenError) {
        console.warn('🔑 Token validation failed, proceeding with request anyway:', tokenError);
      }
    }
    
    // Ensure the endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${normalizedEndpoint}`;
    console.log(`🚀 API REQUEST: ${method} ${url}`);
    
    // Configuring network requests for React Native
    const options: RequestInit = {
      method,
      headers: {
        ...getHeaders(),
        ...(customHeaders || {}),
      },
      // Add these options for React Native HTTP requests
      mode: 'cors',
      cache: 'no-cache',
      credentials: API_CONFIG.CREDENTIALS,
      // Timeouts are handled via AbortController
    };
    
    console.log('🔑 Headers:', JSON.stringify(options.headers, null, 2));
    
    if (data) {
      options.body = JSON.stringify(data);
      console.log('📦 Request Body:', JSON.stringify(data, null, 2));
    }
    
    // Set up AbortController for timeout handling
    const controller = new AbortController();
    options.signal = controller.signal;
    
    // Set timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log('⏱️ Request timed out after', API_CONFIG.TIMEOUT, 'ms');    }, API_CONFIG.TIMEOUT);
    
    console.log('⏱️ Starting fetch request...');
    try {
      const response = await fetch(url, options);
      clearTimeout(timeoutId); // Clear timeout on success
      
      console.log('✅ Fetch completed with status:', response.status);
      console.log('📄 Response headers:', JSON.stringify(Object.fromEntries([...response.headers.entries()]), null, 2));      // Handle error responses
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
          console.error(`❌ API Error (${response.status}):`, errorText || 'No error text');
          
          // Try to parse as JSON for better error handling
          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText);
              console.error('📄 Error details:', JSON.stringify(errorJson, null, 2));
            } catch (e) {
              // Not JSON, just leave as text
            }
          }
        } catch (e) {
          console.error('❌ Failed to read error response:', e);
        }
        
        // Special handling for authentication errors
        if (response.status === 401) {
          console.error('🔑 Authentication error - token may be invalid or expired');
          console.log('🔑 Current token state:', getAuthToken() ? 'Present' : 'Missing');
          
          // Only attempt token refresh if this isn't already a retry request to prevent loops
          if (!isRetry) {
            try {
              const endpointKey = `${method}:${endpoint}`;
              const retryCount = retryCounters.get(endpointKey) || 0;
              console.log(`🔄 Retry count for ${endpointKey}: ${retryCount}`);
              
              // Limit retries to 1 per endpoint within a reset interval
              if (retryCount < 1) {
                // Track this retry attempt
                retryCounters.set(endpointKey, retryCount + 1);
                console.log('🔄 Attempting token refresh before retry');
                
                // Try to refresh the token
                const refreshed = await tokenService.refreshToken();
                if (refreshed) {
                  console.log('🔄 Token refreshed successfully, retrying the original request');
                  // Retry the original request with the new token, but mark as a retry
                  return await apiCall<T>(endpoint, method, data, customHeaders, true);
                } else {
                  // If refresh explicitly failed (returned false), we need to handle authentication failure
                  console.error('🔑 Token refresh failed, user needs to log in again');
                  
                  // Clear the token as it's invalid
                  setAuthToken(null);
                  
                  // Publish an event that the auth context can listen for using AsyncStorage
                  // This is a workaround since we can't use document events in React Native
                  console.log('🔑 Triggering auth failure event');
                  AsyncStorage.setItem('@GameFund:authFailure', Date.now().toString())
                    .then(() => console.log('✅ Auth failure event triggered'))
                    .catch(err => console.error('❌ Failed to trigger auth failure event:', err));
                }
              } else {
                console.warn(`🔄 Skipping retry for ${endpoint} - already retried ${retryCount} times`);
              }
            } catch (refreshError) {
              console.error('🔑 Failed to refresh token:', refreshError instanceof Error ? refreshError.message : refreshError);
              
              // Clear the token on unrecoverable errors
              console.log('🔑 Clearing token due to refresh error');
              setAuthToken(null);
            }
          } else {
            console.warn('🔄 Not attempting token refresh on retry request to prevent loops');
          }
          
          // If we get here, token refresh failed or wasn't possible
          // Clear the token as it's likely invalid
          console.log('🔑 Clearing token after failed auth/refresh');
          setAuthToken(null);
        }
        
        throw new Error(errorText || `API call failed with status: ${response.status}`);
      }

      // Parse the response as JSON
      const responseText = await response.text();
      console.log('📄 Response Text:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
      
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
      throw error;
    }
  } catch (error) {
    console.error(`❌ API ${method} ${endpoint} error:`, error);
    throw error;
  }
};

// Export API methods
export const api = {
  get: <T>(endpoint: string, customHeaders?: Record<string, string>) =>
    apiCall<T>(endpoint, 'GET', undefined, customHeaders),
    
  post: <T>(endpoint: string, data?: any, customHeaders?: Record<string, string>) =>
    apiCall<T>(endpoint, 'POST', data, customHeaders),
    
  put: <T>(endpoint: string, data?: any, customHeaders?: Record<string, string>) =>
    apiCall<T>(endpoint, 'PUT', data, customHeaders),
    
  patch: <T>(endpoint: string, data?: any, customHeaders?: Record<string, string>) =>
    apiCall<T>(endpoint, 'PATCH', data, customHeaders),
    
  delete: <T>(endpoint: string, customHeaders?: Record<string, string>) =>
    apiCall<T>(endpoint, 'DELETE', undefined, customHeaders),
};

// Mock API implementation for development
export const mockApi = {
  get: <T>(endpoint: string): Promise<T> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({} as T);
      }, 500);
    });
  },
  
  post: <T>(endpoint: string, data?: any): Promise<T> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({} as T);
      }, 500);
    });
  },
  
  put: <T>(endpoint: string, data?: any): Promise<T> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({} as T);
      }, 500);
    });
  },
  
  delete: <T>(endpoint: string): Promise<T> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({} as T);
      }, 500);
    });
  },
};

// Function to determine whether to use the real API or the mock API
export const getApi = () => {
  // Check if we're in development mode and if we want to use mock data
  // You can modify this by setting an environment variable or a local setting
  const useMockApi = process.env.NODE_ENV === 'development' && process.env.USE_MOCK_API === 'true';
  return useMockApi ? mockApi : api;
};

// This warning is to help developers understand that they should use direct imports
// to avoid circular dependencies
console.warn(
  "IMPORTANT: To avoid circular references, import 'api' directly instead of using 'getApi()':\n" +
  "import { api } from './api.service';\n" +
  "const response = await api.get('/endpoint');"
);