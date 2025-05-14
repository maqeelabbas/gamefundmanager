// src/services/expense.service.ts
import { api } from './api.service'; // Direct import to avoid circular reference
import { ApiResponse } from '../config/api.config';
import { Expense, ExpenseStatus, CreateExpenseRequest } from '../models/expense.model';

class ExpenseService {
  // Get group expenses
  async getGroupExpenses(groupId: string): Promise<Expense[]> {
    try {
      const response = await api.get<ApiResponse<Expense[]>>(`/expenses/group/${groupId}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        // Return empty array instead of throwing error
        console.log('No expenses found or error fetching expenses:', response.message);
        return [];
      }
    } catch (error) {
      console.error(`Get expenses for group ${groupId} error:`, error);
      // Return empty array for easier handling in UI
      return [];
    }
  }

  // Get expenses by status for a group
  async getExpensesByStatus(groupId: string, status: ExpenseStatus): Promise<Expense[]> {
    try {
      const response = await api.get<ApiResponse<Expense[]>>(`/expenses/group/${groupId}/status/${status}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        // Return empty array instead of throwing error
        console.log(`No ${status} expenses found or error fetching:`, response.message);
        return [];
      }
    } catch (error) {
      console.error(`Get ${status} expenses for group ${groupId} error:`, error);
      return [];
    }
  }

  // Get expense by ID
  async getExpenseById(id: string): Promise<Expense> {
    try {
      const response = await api.get<ApiResponse<Expense>>(`/expenses/${id}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Expense not found');
      }
    } catch (error) {
      console.error(`Get expense ${id} error:`, error);
      throw error;
    }
  }

  // Create a new expense
  async createExpense(expenseData: CreateExpenseRequest): Promise<Expense> {
    try {
      const response = await api.post<ApiResponse<Expense>>('/expenses', expenseData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create expense');
      }
    } catch (error) {
      console.error('Create expense error:', error);
      throw error;
    }
  }

  // Update an existing expense
  async updateExpense(id: string, expenseData: CreateExpenseRequest): Promise<Expense> {
    try {
      const response = await api.put<ApiResponse<Expense>>(`/expenses/${id}`, expenseData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update expense');
      }
    } catch (error) {
      console.error(`Update expense ${id} error:`, error);
      throw error;
    }
  }

  // Delete an expense
  async deleteExpense(id: string): Promise<boolean> {
    try {
      const response = await api.delete<ApiResponse<boolean>>(`/expenses/${id}`);
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete expense');
      }
    } catch (error) {
      console.error(`Delete expense ${id} error:`, error);
      throw error;
    }
  }

  // Change expense status
  async changeExpenseStatus(id: string, status: ExpenseStatus): Promise<Expense> {
    try {
      const response = await api.patch<ApiResponse<Expense>>(`/expenses/${id}/status/${status}`, {});
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || `Failed to change expense status to ${status}`);
      }
    } catch (error) {
      console.error(`Change expense ${id} status error:`, error);
      throw error;
    }
  }
}

export const expenseService = new ExpenseService();
