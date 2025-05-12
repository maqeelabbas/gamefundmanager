// src/services/user.service.ts
import { ApiResponse } from '../config/api.config';
import { User } from '../models/user.model';
import { api } from './api.service'; // Direct import to avoid circular reference

class UserService {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await api.get<ApiResponse<User[]>>('/users');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to get users');
      }
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>(`/users/${id}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'User not found');
      }
    } catch (error) {
      console.error(`Get user ${id} error:`, error);
      throw error;
    }
  }

  // Update user profile
  async updateUser(id: string, userData: any): Promise<any> {
    try {
      console.log('Updating user with data:', userData);
      
      // Map from app's User model to API's User model if needed
      const apiUserData: any = {};
      
      if (userData.name) {
        // Split name into first and last name if needed
        const nameParts = userData.name.split(' ');
        apiUserData.firstName = nameParts[0] || '';
        apiUserData.lastName = nameParts.slice(1).join(' ') || '';
      }
      
      if (userData.email) {
        apiUserData.email = userData.email;
      }
      
      if (userData.phoneNumber) {
        apiUserData.phoneNumber = userData.phoneNumber;
      }
      
      // Other fields can be mapped here if needed
      
      console.log(`Sending PUT request to /users/${id}`, apiUserData);
      
      // Use direct API for simplicity and to reduce potential circular references
      const response = await api.put<ApiResponse<User>>(`/users/${id}`, apiUserData);
      
      if (response.success && response.data) {
        // Convert API User model back to app's User model
        const result = {
          id: response.data.id,
          name: `${response.data.firstName || ''} ${response.data.lastName || ''}`.trim(),
          email: response.data.email,
          phoneNumber: response.data.phoneNumber || '',
          role: 'player' // Default role
        };
        
        console.log('Successfully updated user:', result);
        return result;
      } else {
        throw new Error(response.message || 'Failed to update user');
      }
    } catch (error) {
      console.error(`Update user ${id} error:`, error);
      throw error;
    }
  }
}

export const userService = new UserService();
