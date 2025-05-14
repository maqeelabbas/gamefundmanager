// src/services/auth.service.ts
import { getApi, setAuthToken } from './api.service';
import { ApiResponse } from '../config/api.config';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';

// Legacy auth response for compatibility with existing code
export interface LegacyAuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

// Auth service class
class AuthService {
  // Login function
  async login(email: string, password: string): Promise<LegacyAuthResponse> {
    try {
      const api = getApi();
      const loginData: LoginRequest = { email, password };
      
      // Call the API
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', loginData);
      
      // Extract data from response
      if (response.success && response.data) {
        // Set auth token for future API calls
        setAuthToken(response.data.token);
        
        // Map to legacy format for compatibility with existing code
        const legacyResponse: LegacyAuthResponse = {
          user: {
            id: response.data.userId,
            name: `${response.data.firstName} ${response.data.lastName}`,
            email: response.data.email,
            role: 'member', // Default role - updated from 'player'
          },
          token: response.data.token
        };
        
        return legacyResponse;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  // Register function
  async register(username: string, email: string, password: string, firstName: string, lastName: string, phoneNumber?: string): Promise<LegacyAuthResponse> {
    try {
      const api = getApi();
      const registerData: RegisterRequest = {
        username,
        email,
        password,
        confirmPassword: password, // Same password for both fields
        firstName,
        lastName,
        phoneNumber
      };
      
      // Call the API
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', registerData);
      
      // Extract data from response
      if (response.success && response.data) {
        // Set auth token for future API calls
        setAuthToken(response.data.token);
        
        // Map to legacy format for compatibility with existing code
        const legacyResponse: LegacyAuthResponse = {
          user: {
            id: response.data.userId,
            name: `${response.data.firstName} ${response.data.lastName}`,
            email: response.data.email,
            role: 'member', // Default role - updated from 'player'
          },
          token: response.data.token
        };
        
        return legacyResponse;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }
  
  // Get current user profile
  async getCurrentUser(): Promise<User> {
    try {
      const api = getApi();
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
  
  // Logout function
  logout(): void {
    // Clear the auth token
    setAuthToken(null);
  }
  
  // For development/testing - get a mock response
  getMockResponse(email: string, name?: string): LegacyAuthResponse {
    // Mock user ID generation
    const userId = Math.random().toString(36).substring(2, 15);
    
    // Use provided name or generate one from email
    const userName = name || email.split('@')[0];
    
    return {
      user: {
        id: userId,
        name: userName,
        email,
        role: 'player',
      },
      token: `mock_token_${userId}`, // Mock token
    };
  }
}

export const authService = new AuthService();
