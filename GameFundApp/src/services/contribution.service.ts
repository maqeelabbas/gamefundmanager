// src/services/contribution.service.ts
import { api } from './api.service'; // Direct import to avoid circular reference
import { ApiResponse } from '../config/api.config';
import { Contribution, CreateContributionRequest, ContributionStatus } from '../models/contribution.model';

class ContributionService {
  // Get group contributions
  async getGroupContributions(groupId: string): Promise<Contribution[]> {
    try {
      const response = await api.get<ApiResponse<Contribution[]>>(`/contributions/group/${groupId}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        // Return empty array instead of throwing error
        console.log('No contributions found or error fetching contributions:', response.message);
        return [];
      }
    } catch (error) {
      console.error(`Get contributions for group ${groupId} error:`, error);
      // Return empty array for easier handling in UI
      return [];
    }
  }

  // Get user contributions
  async getUserContributions(): Promise<Contribution[]> {
    try {
      const response = await api.get<ApiResponse<Contribution[]>>('/contributions/user');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        // Return empty array instead of throwing error
        console.log('No user contributions found or error fetching:', response.message);
        return [];
      }
    } catch (error) {
      console.error('Get user contributions error:', error);
      return [];
    }
  }

  // Get contribution by ID
  async getContributionById(id: string): Promise<Contribution> {
    try {
      const response = await api.get<ApiResponse<Contribution>>(`/contributions/${id}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Contribution not found');
      }
    } catch (error) {
      console.error(`Get contribution ${id} error:`, error);
      throw error;
    }
  }

  // Add a new contribution
  async addContribution(contributionData: CreateContributionRequest): Promise<Contribution> {
    try {
      const response = await api.post<ApiResponse<Contribution>>('/contributions', contributionData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to add contribution');
      }
    } catch (error) {
      console.error('Add contribution error:', error);
      throw error;
    }
  }

  // Update a contribution
  async updateContribution(id: string, contributionData: CreateContributionRequest): Promise<Contribution> {
    try {
      const response = await api.put<ApiResponse<Contribution>>(`/contributions/${id}`, contributionData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update contribution');
      }
    } catch (error) {
      console.error(`Update contribution ${id} error:`, error);
      throw error;
    }
  }
  // Get contributions by status
  async getContributionsByStatus(groupId: string, status: ContributionStatus): Promise<Contribution[]> {
    try {
      const response = await api.get<ApiResponse<Contribution[]>>(
        `/contributions/group/${groupId}/status/${status}`
      );
      
      if (response.success && response.data) {
        return response.data;
      } else {
        // Return empty array instead of throwing error
        console.log(`No ${status} contributions found or error fetching:`, response.message);
        return [];
      }
    } catch (error) {
      console.error(`Get ${status} contributions for group ${groupId} error:`, error);
      return [];
    }
  }

  // Update contribution status
  async updateContributionStatus(id: string, status: ContributionStatus): Promise<Contribution> {
    try {
      const response = await api.put<ApiResponse<Contribution>>(
        `/contributions/${id}/status/${status}`
      );
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update contribution status');
      }
    } catch (error) {
      console.error(`Update contribution ${id} status error:`, error);
      throw error;
    }
  }

  // Delete a contribution
  async deleteContribution(id: string): Promise<boolean> {
    try {
      const response = await api.delete<ApiResponse<boolean>>(`/contributions/${id}`);
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete contribution');
      }
    } catch (error) {
      console.error(`Delete contribution ${id} error:`, error);
      throw error;
    }
  }
}

export const contributionService = new ContributionService();