import { User } from './user.model';

// Group model matching backend GroupDto
export interface Group {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  targetAmount: number;
  dueDate?: Date;
  isActive: boolean;
  currency: string;
  ownerId: string;
  owner?: User;
  memberCount: number;
  totalContributions: number;
  totalExpenses: number;
  balance: number;
  progressPercentage: number;
  isUserAdmin?: boolean; // Indicates if the current user is an admin for this group
  contributionDueDay?: number;
  nextContributionDueDate?: Date;
  contributionDueDayFormatted?: string;
}

// Create group request model matching backend CreateGroupDto
export interface CreateGroupRequest {
  name: string;
  description: string;
  logoUrl?: string;
  targetAmount: number;
  dueDate?: Date;
  currency: string;
  contributionDueDay?: number;
}

// Group member model matching backend GroupMemberDto
export interface GroupMember {
  id: string;
  groupId: string;
  user: User;
  isAdmin: boolean;
  contributionQuota: number;
  isActive: boolean;
  joinedDate: Date;
  contributionStartDate?: Date;
  isContributionPaused: boolean;
  contributionPauseStartDate?: Date;
  contributionPauseEndDate?: Date;
}

// Add group member request model matching backend AddGroupMemberDto
export interface AddGroupMemberRequest {
  userId: string;
  isAdmin: boolean;
  contributionStartDate?: Date;
}

// Pause member contribution request model matching backend PauseMemberContributionDto
export interface PauseMemberContributionRequest {
  memberId: string;
  pauseStartDate: Date;
  pauseEndDate: Date;
}
