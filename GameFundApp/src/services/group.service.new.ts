// src/services/group.service.ts
import { ApiResponse } from '../config/api.config';
import { Group, CreateGroupRequest, GroupMember, AddGroupMemberRequest } from '../models/group.model';
import { api } from './api.service'; // Direct import to avoid circular reference

class GroupService {
  // Get all groups
  async getAllGroups(): Promise<Group[]> {
    try {
      const response = await api.get<ApiResponse<Group[]>>('/groups');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to get groups');
      }
    } catch (error) {
      console.error('Get all groups error:', error);
      throw error;
    }
  }

  // Get group by ID
  async getGroupById(id: string): Promise<Group> {
    try {
      const response = await api.get<ApiResponse<Group>>(`/groups/${id}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Group not found');
      }
    } catch (error) {
      console.error(`Get group ${id} error:`, error);
      throw error;
    }
  }

  // Get user's groups
  async getUserGroups(): Promise<Group[]> {
    try {
      const response = await api.get<ApiResponse<Group[]>>('/groups/user');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        // Return empty array instead of throwing error when no groups
        console.log('No groups found or error fetching groups:', response.message);
        return [];
      }
    } catch (error) {
      console.error('Get user groups error:', error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  // Create new group
  async createGroup(groupData: CreateGroupRequest): Promise<Group> {
    try {
      const response = await api.post<ApiResponse<Group>>('/groups', groupData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create group');
      }
    } catch (error) {
      console.error('Create group error:', error);
      throw error;
    }
  }

  // Update group
  async updateGroup(id: string, groupData: Partial<Group>): Promise<Group> {
    try {
      const response = await api.put<ApiResponse<Group>>(`/groups/${id}`, groupData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update group');
      }
    } catch (error) {
      console.error(`Update group ${id} error:`, error);
      throw error;
    }
  }

  // Delete group
  async deleteGroup(id: string): Promise<boolean> {
    try {
      const response = await api.delete<ApiResponse<boolean>>(`/groups/${id}`);
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete group');
      }
    } catch (error) {
      console.error(`Delete group ${id} error:`, error);
      throw error;
    }
  }

  // Add group member
  async addGroupMember(groupId: string, memberData: AddGroupMemberRequest): Promise<GroupMember> {
    try {
      const response = await api.post<ApiResponse<GroupMember>>(`/groups/${groupId}/members`, memberData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to add group member');
      }
    } catch (error) {
      console.error(`Add member to group ${groupId} error:`, error);
      throw error;
    }
  }

  // Remove group member
  async removeGroupMember(groupId: string, userId: string): Promise<boolean> {
    try {
      const response = await api.delete<ApiResponse<boolean>>(`/groups/${groupId}/members/${userId}`);
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'Failed to remove group member');
      }
    } catch (error) {
      console.error(`Remove member from group ${groupId} error:`, error);
      throw error;
    }
  }
}

export const groupService = new GroupService();
