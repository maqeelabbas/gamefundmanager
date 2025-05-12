import { User } from './user.model';

// Poll type enum matching backend PollType
export enum PollType {
  SingleChoice = 'SingleChoice',
  MultipleChoice = 'MultipleChoice'
}

// Poll option model matching backend PollOptionDto
export interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  votePercentage: number;
}

// Poll model matching backend PollDto
export interface Poll {
  id: string;
  title: string;
  description: string;
  expiryDate: Date;
  pollType: PollType;
  pollTypeName: string;
  isActive: boolean;
  isExpired: boolean;
  groupId: string;
  createdByUserId: string;
  createdByUser?: User;
  options: PollOption[];
  totalVotes: number;
  userVote?: PollOption;
}

// Create poll request model matching backend CreatePollDto
export interface CreatePollRequest {
  groupId: string;
  title: string;
  description: string;
  expiryDate: Date;
  pollType: PollType;
  options: { text: string }[];
}

// Submit poll vote request model matching backend SubmitPollVoteDto
export interface SubmitPollVoteRequest {
  pollId: string;
  optionIds: string[];
}
