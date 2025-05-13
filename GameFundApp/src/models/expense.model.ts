import { User } from './user.model';

// Expense status enum matching backend ExpenseStatus
export enum ExpenseStatus {
  Proposed = 'Proposed',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

// Expense model matching backend ExpenseDto
export interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number;
  expenseDate: Date;
  status: ExpenseStatus;
  statusName: string;
  receiptUrl?: string;
  groupId: string;
  createdByUserId: string;
  createdByUser?: User;
}

// Create expense request model matching backend CreateExpenseDto
export interface CreateExpenseRequest {
  title: string;
  description: string;
  amount: number;
  expenseDate: Date;
  receiptUrl?: string;
  groupId: string;
  paidByUserId?: string; // ID of the user who paid for the expense
}
