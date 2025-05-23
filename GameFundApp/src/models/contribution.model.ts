import { User } from "./user.model";

// Contribution status enum matching backend ContributionStatus
export enum ContributionStatus {
  Pending = "Pending",
  Paid = "Paid",
  Rejected = "Rejected",
  Refunded = "Refunded",
  Cancelled = "Cancelled",
}

// Contribution model matching backend ContributionDto
export interface Contribution {
  id: string;
  amount: number;
  description: string;
  contributionDate: Date;
  paymentMethod?: string;
  transactionReference?: string;
  groupId: string;
  contributorUserId: string; // User who is making the payment
  createdByUserId: string; // User who created the record
  contributorUser?: User; // Contributing user
  createdByUser?: User; // User who created the record
  status: ContributionStatus; // Updated to use the enum
  statusName: string; // Display name for the status
}

// Create contribution request model matching backend CreateContributionDto
export interface CreateContributionRequest {
  amount: number;
  description: string;
  contributionDate: Date;
  paymentMethod?: string;
  transactionReference?: string;
  groupId: string;
  contributorUserId?: string; // Optional - if not provided, the creator is also the contributor
  status?: ContributionStatus; // Default will be Pending on the backend
}
