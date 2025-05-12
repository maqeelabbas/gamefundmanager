import { User } from './user.model';

// Contribution model matching backend ContributionDto
export interface Contribution {
  id: string;
  amount: number;
  description: string;
  contributionDate: Date;
  paymentMethod?: string;
  transactionReference?: string;
  groupId: string;
  userId: string;
  user?: User;
  isPaid?: boolean; // Flag to indicate if the contribution has been paid
  status?: 'paid' | 'pending'; // Status of the contribution
}

// Create contribution request model matching backend CreateContributionDto
export interface CreateContributionRequest {
  amount: number;
  description: string;
  contributionDate: Date;
  paymentMethod?: string;
  transactionReference?: string;
  groupId: string;
}
