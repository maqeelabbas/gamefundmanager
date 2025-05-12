// src/services/poll.service.ts
import { getApi } from './api.service';
import { ApiResponse } from '../config/api.config';
import { 
  Poll, 
  CreatePollRequest,
  SubmitPollVoteRequest
} from '../models/poll.model';

class PollService {
  // Get group polls
  async getGroupPolls(groupId: string): Promise<Poll[]> {
    try {
      const api = getApi();
      const response = await api.get<ApiResponse<Poll[]>>(`/polls/group/${groupId}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to get group polls');
      }
    } catch (error) {
      console.error(`Get polls for group ${groupId} error:`, error);
      throw error;
    }
  }

  // Get poll by ID
  async getPollById(id: string): Promise<Poll> {
    try {
      const api = getApi();
      const response = await api.get<ApiResponse<Poll>>(`/polls/${id}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Poll not found');
      }
    } catch (error) {
      console.error(`Get poll ${id} error:`, error);
      throw error;
    }
  }

  // Create a new poll
  async createPoll(pollData: CreatePollRequest): Promise<Poll> {
    try {
      const api = getApi();
      const response = await api.post<ApiResponse<Poll>>('/polls', pollData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create poll');
      }
    } catch (error) {
      console.error('Create poll error:', error);
      throw error;
    }
  }

  // Submit a vote for a poll
  async submitVote(voteData: SubmitPollVoteRequest): Promise<Poll> {
    try {
      const api = getApi();
      const response = await api.post<ApiResponse<Poll>>('/polls/vote', voteData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to submit vote');
      }
    } catch (error) {
      console.error('Submit vote error:', error);
      throw error;
    }
  }

  // Close a poll (if you have admin rights)
  async closePoll(id: string): Promise<Poll> {
    try {
      const api = getApi();
      const response = await api.put<ApiResponse<Poll>>(`/polls/${id}/close`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to close poll');
      }
    } catch (error) {
      console.error(`Close poll ${id} error:`, error);
      throw error;
    }
  }

  // Delete a poll
  async deletePoll(id: string): Promise<void> {
    try {
      const api = getApi();
      const response = await api.delete<ApiResponse<void>>(`/polls/${id}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete poll');
      }
    } catch (error) {
      console.error(`Delete poll ${id} error:`, error);
      throw error;
    }
  }
}

export const pollService = new PollService();
