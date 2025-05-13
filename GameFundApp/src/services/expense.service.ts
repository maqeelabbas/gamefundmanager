// src/services/expense.service.ts
import { api } from './api.service'; // Direct import to avoid circular reference
import { ApiResponse } from '../config/api.config';
import { Expense, ExpenseStatus, CreateExpenseRequest } from '../models/expense.model';

class ExpenseService {  // Get group expenses
  async getGroupExpenses(groupId: string): Promise<Expense[]> {
    try {
      console.log(`Expense service: Fetching expenses for group ${groupId}`);
      const response = await api.get<ApiResponse<Expense[]>>(`/expenses/group/${groupId}`);
      
      if (response.success && response.data) {
        console.log(`Expense service: Found ${response.data.length} expenses for group ${groupId}`);
        return response.data;
      } else {
        // Return empty array instead of throwing error
        console.log('Expense service: No expenses found or error fetching expenses:', response.message);
        return [];
      }
    } catch (error) {
      console.error(`Expense service: Get expenses for group ${groupId} error:`, error);
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
      console.log('Expense service: Sending data to API:', JSON.stringify(expenseData, null, 2));
      const response = await api.post<ApiResponse<Expense>>('/expenses', expenseData);
      console.log('Expense service: API response received:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        console.log('Expense service: Successfully created expense with ID:', response.data.id);
        return response.data;
      } else {
        console.error('Expense service: API returned success=false or no data:', response);
        throw new Error(response.message || 'Failed to create expense - API returned success=false');
      }
    } catch (error) {
      console.error('Expense service: Create expense error:', error);
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