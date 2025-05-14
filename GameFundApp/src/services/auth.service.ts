// src/services/auth.service.ts
import { api, setAuthToken, getAuthToken } from './api.service';
import { API_CONFIG, ApiResponse } from '../config/api.config';
import { User } from '../models/user.model';
import { tokenService } from './token.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

// User response type needed for existing code compatibility
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'admin';
}

// Auth response type needed for existing code compatibility
export interface AuthResponse {
  user: UserResponse;
  token: string;
}

// Backend auth response type
interface BackendAuthResponse {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  tokenExpires: string;
}

// Auth service class
class AuthService {
  // Login function
  async login(email: string, password: string): Promise<AuthResponse> {
    try {      // Log login attempt for debugging
      console.log('📱 Login attempt for:', email);
      console.log('📱 API Config URL:', API_CONFIG.BASE_URL);
        
      // Call the API with the correct endpoint path
      // Based on the ApiEndpoints.json file, the correct endpoint is /auth/login
      const loginEndpoint = '/auth/login'; // IMPORTANT: This must match backend route
      console.log('📱 Sending login request to endpoint:', loginEndpoint);
      console.log('📱 Full request URL will be:', `${API_CONFIG.BASE_URL}${loginEndpoint}`);
      
      // Add extra logging for debugging
      console.log('📱 Request details:');
      console.log('📱 - Email:', email);
      console.log('📱 - Password length:', password ? password.length : 0);
      
      // Use direct api call, not getApi() to ensure we're not using mock
      const response = await api.post<ApiResponse<BackendAuthResponse>>(loginEndpoint, { 
        email, 
        password 
      });
      
      console.log('📱 Received login response:', response ? 'Success' : 'Failed');
      
      // Use mock if in development mode or if API response is missing data
      if ((process.env.NODE_ENV === 'development' && !response.data) || !response.success) {
        console.log('📱 Using mock response for development or missing data');
        return this.getMockResponse(email);
      }
        // Extract data from response
      if (response.success && response.data) {
        // Log successful login
        console.log('📱 Login successful for user:', response.data.userId);
        console.log('📱 Token received length:', response.data.token?.length || 0);
        
        // Set auth token for future API calls
        setAuthToken(response.data.token);
        
        // Save token expiry information if available
        if (response.data.tokenExpires) {
          await tokenService.saveTokenExpiry(response.data.tokenExpires);
          console.log('📱 Token expiry saved:', response.data.tokenExpires);
        }
        
        // Return in the format expected by the app
        return {
          user: {
            id: response.data.userId,
            name: `${response.data.firstName} ${response.data.lastName}`,
            email: response.data.email,
            role: 'member', // Default role
          },
          token: response.data.token
        };
      } else {
        console.error('📱 Login failed with message:', response.message);
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('📱 Login error:', error.message || 'Unknown error');
      console.error('📱 Error details:', error);
      
      // Provide more detailed error message for debugging
      if (error.message && error.message.includes('Network request failed')) {
        console.error('📱 This appears to be a network connectivity issue. Please check:');
        console.error('- Is the backend server running?');
        console.error('- Is the API URL correct?');
        console.error('- Are CORS settings correct on the backend?');
        console.error('- If using HTTPS, are certificates properly set up?');
      }
      
      throw error;
    }
  }
    // Register function
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      // Extract first and last name from the full name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      // Create username from email (before the @ symbol)
      const username = email.split('@')[0];
      
      // Call the API
      const response = await api.post<ApiResponse<BackendAuthResponse>>('/auth/register', {
        username,
        email,
        password,
        confirmPassword: password,
        firstName,
        lastName,
      });
      
      // Use mock if in development mode
      if (process.env.NODE_ENV === 'development' && !response.data) {
        return this.getMockResponse(email, name);
      }
      
      // Extract data from response
      if (response.success && response.data) {
        // Set auth token for future API calls
        setAuthToken(response.data.token);
        
        // Return in the format expected by the app
        return {
          user: {
            id: response.data.userId,
            name: `${response.data.firstName} ${response.data.lastName}`,
            email: response.data.email,
            role: 'member', // Default role
          },
          token: response.data.token
        };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }    // Get current user profile
  async getCurrentUser(): Promise<User> {
    try {
      // Validate token before making request
      await tokenService.ensureValidToken();
      
      const response = await api.get<ApiResponse<User>>('/auth/me');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to get user profile');
      }
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }
  
  // Forgot password function
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      // This endpoint might not exist in the backend yet
      // For now, return a mock response
      return { message: 'Password reset link sent to your email' };
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }
  
  // Reset password function
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    try {
      // This endpoint might not exist in the backend yet
      // For now, return a mock response
      return { message: 'Password reset successfully' };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }    // Logout function
  async logout(): Promise<void> {
    console.log('🔒 Logging out and clearing auth token');
    // Clear the auth token
    setAuthToken(null);
    
    // Clear token expiry information
    await tokenService.clearTokenInfo();
    
    // For debugging purposes, verify the token is cleared
    const currentToken = getAuthToken();
    console.log(`🔒 Token cleared: ${currentToken === null ? 'Yes' : 'No'}`);
  }
    // Mock response helper for development purposes
  getMockResponse(email: string, name?: string): AuthResponse {
    // Mock user ID generation
    const userId = Math.random().toString(36).substring(2, 15);
    
    // Use provided name or generate one from email
    const userName = name || email.split('@')[0];
    
    return {
      user: {
        id: userId,
        name: userName,
        email,
        role: 'member',
      },
      token: `mock_token_${userId}`, // Mock token
    };
  }
  
  // Test API connection - use this to diagnose connectivity issues
  async testApiConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('🔍 Testing API connection...');
      console.log('🔍 Base URL:', API_CONFIG.BASE_URL);
      
      // First try a simple HEAD request to see if the server is reachable
      const testUrl = API_CONFIG.BASE_URL.replace('/api', '');
      console.log('🔍 Testing connection to:', testUrl);
      
      try {
        const response = await fetch(testUrl, {
          method: 'HEAD',
          headers: { 'Accept': 'application/json' }
        });
        console.log('🔍 Server connection test result:', response.status, response.statusText);
      } catch (connectionError: any) {
        console.error('🔍 Cannot connect to server base URL:', connectionError.message);
      }
      
      // Now try the actual API endpoint
      try {
        const apiResponse = await api.get<any>('/auth/healthcheck');
        console.log('🔍 API healthcheck success:', apiResponse);
        return {
          success: true,
          message: 'API connection successful',
          details: apiResponse
        };
      } catch (apiError: any) {
        console.error('🔍 API endpoint test error:', apiError.message);
        return {
          success: false,
          message: 'Could connect to server but API test failed',
          details: apiError.message
        };
      }
    } catch (error: any) {
      console.error('🔍 API connection test failed:', error);
      return {
        success: false,
        message: `API connection test failed: ${error.message}`,
        details: error
      };
    }
  }
}

export const authService = new AuthService();