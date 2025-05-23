// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/auth.service';
import { Platform } from 'react-native';
import { setAuthToken } from '../services/http.service';
import { authDebugger } from '../utils/authDebugger';

// Import types from models
import { User as ApiUser } from '../models/user.model';

// Define user type for the context
interface User {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'admin';
  phoneNumber?: string;
}

// Define context value type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserInfo: (updatedUser: Partial<User>) => void;
  resetTokenState: () => Promise<void>;
  debugAuthState: () => Promise<void>;
}

// Keys for AsyncStorage
const TOKEN_KEY = '@GameFund:token';
const USER_KEY = '@GameFund:user';

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUserInfo: () => {},
  resetTokenState: async () => {},
  debugAuthState: async () => {},
});

// Provider component
export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with true for initial auth check  // Load saved auth state on app start
  useEffect(() => {
    const loadStoredAuthState = async () => {
      try {
        console.log('🔑 Loading stored authentication state...');
        
        // Load token and user data from AsyncStorage
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        const userData = await AsyncStorage.getItem(USER_KEY);
        
        // Debug auth state to check token validity with the server
        const debugAuthState = async (token: string) => {
          try {
            const { api } = require('../services/api.service');
            const response = await api.get('/auth/validate-token');
            console.log('🔑 Auth debug check result:', response);
            return true;
          } catch (error) {
            console.error('🔑 Auth debug check failed:', error);
            return false;
          }
        };

        console.log(`🔑 Auth state loaded: Token exists: ${!!token}, User exists: ${!!userData}`);

        if (token && userData) {
          try {          // Basic token validation - make sure it's in JWT format
            if (!token.includes('.') || token.split('.').length !== 3) {
              console.error('🔑 Invalid token format detected, logging out');
              await clearAuthState();
              setAuthToken(null);
              return;
            }
            
            // Validate token against backend before setting
            try {
              // Set the token in the API service first
              setAuthToken(token);
              
              // Now validate with the backend
              const { api } = require('../services/api.service');
              await api.get('/auth/validate-token');
              console.log('🔑 Token validated with backend successfully');
            } catch (validationError) {
              console.error('🔑 Token validation with backend failed:', validationError);
              // We'll still proceed with the token since the validation might fail due to 
              // temporary network issues
            }
              // Parse the user data directly without validation
            const parsedUser = JSON.parse(userData);            setUser(parsedUser);
            console.log(`🔑 User authenticated: ${parsedUser.name} (${parsedUser.email})`);
            
            // Validate token with backend silently
            debugAuthState(token).catch(e => {
              console.log('🔑 Silent token validation failed:', e);
            });
          } catch (parseError) {
            console.error('🔑 Error parsing user data:', parseError);
            await clearAuthState();
            setAuthToken(null);
          }
        } else {
          console.log('🔑 No saved authentication found');
          // Ensure token is cleared if no stored data
          setAuthToken(null);
        }
      } catch (error) {
        console.error('🔑 Error loading auth state:', error);
        // Ensure token is cleared on error
        setAuthToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuthState();
      // Add listener for auth failures that can happen anywhere in the app
    const handleAuthFailure = () => {
      console.log('🔑 Auth failure event received, logging out user');
      logout();
    };
    
    // Use AsyncStorage as a simple event bus since document is not available in React Native
    const checkAuthFailureInterval = setInterval(async () => {
      try {
        const failureTime = await AsyncStorage.getItem('@GameFund:authFailure');
        if (failureTime) {
          const now = Date.now();
          const failureTimeNum = parseInt(failureTime, 10);
          
          // Only process recent failures (within last 10 seconds)
          if (now - failureTimeNum < 10000) {
            console.log('🔑 Auth failure detected via AsyncStorage, logging out user');
            await AsyncStorage.removeItem('@GameFund:authFailure');
            logout();
          }
        }
      } catch (e) {
        // Ignore errors
      }
    }, 2000);
    
    return () => {
      clearInterval(checkAuthFailureInterval);
    };
  }, []);

  // Save authentication state to AsyncStorage
  const saveAuthState = async (token: string, userData: User) => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  };

  // Clear authentication state from AsyncStorage
  const clearAuthState = async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  };
  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Use the auth service to login
      const response = await authService.login(email, password);
      
      if (!response || !response.user) {
        throw new Error('Invalid response from login');
      }
      
      // Save user data
      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role as 'member' | 'admin',
      };
      
      setUser(userData);
      
      // Save authentication state
      await saveAuthState(response.token, userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Use the auth service to register
      const response = await authService.register(name, email, password);
      
      // Save user data
      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role as 'member' | 'admin',
      };
      
      setUser(userData);
      
      // Save authentication state
      await saveAuthState(response.token, userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  // Logout function
  const logout = async () => {
    authService.logout();
    setUser(null);
    await clearAuthState();
  };
  // Update user information
  const updateUserInfo = (updatedUser: Partial<User>) => {
    if (user) {
      // Merge the existing user with the updated fields
      const newUserData = { ...user, ...updatedUser };
      setUser(newUserData);
      
      // Get the current token directly from AsyncStorage
      AsyncStorage.getItem(TOKEN_KEY).then(token => {
        if (!token) {
          console.warn('⚠️ Attempting to update user info without a valid auth token');
          token = ''; // Use empty string as fallback
        }
        
        // Save the updated user to storage
        saveAuthState(token, newUserData);
        console.log('👤 User info updated:', updatedUser);
      }).catch(error => {
        console.error('Error getting token for user update:', error);
      });
    } else {
      console.warn('⚠️ Cannot update user info: No user is currently logged in');
    }
  };
  // Reset token state
  const resetTokenState = async () => {
    try {
      console.log('🔄 Resetting token state...');
      await authDebugger.resetTokenState();
      console.log('✅ Token state reset complete');
    } catch (error) {
      console.error('❌ Error resetting token state:', error);
    }
  };

  // Debug auth state
  const debugAuthState = async () => {
    try {
      console.log('🔍 Running auth diagnostics...');
      await authDebugger.logAuthState();
    } catch (error) {
      console.error('❌ Error in auth diagnostics:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated: !!user,
      login, 
      register, 
      logout,
      updateUserInfo,
      resetTokenState,
      debugAuthState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access to the auth context
export const useAuth = () => useContext(AuthContext);
