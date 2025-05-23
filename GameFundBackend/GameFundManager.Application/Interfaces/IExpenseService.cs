using GameFundManager.Application.Common;
using GameFundManager.Application.DTOs;
using GameFundManager.Core.Entities;

namespace GameFundManager.Application.Interfaces;

public interface IExpenseService
{
    Task<ApiResponse<IEnumerable<ExpenseDto>>> GetGroupExpensesAsync(Guid groupId);
    Task<ApiResponse<IEnumerable<ExpenseDto>>> GetExpensesByStatusAsync(Guid groupId, ExpenseStatus status);
    Task<ApiResponse<IEnumerable<ExpenseDto>>> GetGroupExpensesByUserAsync(Guid groupId, Guid userId);
    Task<ApiResponse<IEnumerable<ExpenseDto>>> GetGroupExpensesByUserAndStatusAsync(Guid groupId, Guid userId, ExpenseStatus status);
    Task<ApiResponse<ExpenseDto>> GetExpenseByIdAsync(Guid id);
    Task<ApiResponse<ExpenseDto>> CreateExpenseAsync(CreateExpenseDto expenseDto, Guid userId);
    Task<ApiResponse<ExpenseDto>> UpdateExpenseAsync(Guid id, CreateExpenseDto expenseDto, Guid userId);
    Task<ApiResponse<ExpenseDto>> UpdateExpenseStatusAsync(Guid id, ExpenseStatus status, Guid userId);
    Task<ApiResponse<bool>> DeleteExpenseAsync(Guid id, Guid userId);
    
    // New method to get all expenses paid by a specific user regardless of group
    Task<ApiResponse<IEnumerable<ExpenseDto>>> GetAllExpensesPaidByUserAsync(Guid userId);
}
