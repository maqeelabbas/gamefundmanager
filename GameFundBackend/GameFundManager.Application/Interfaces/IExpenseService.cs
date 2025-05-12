using GameFundManager.Application.Common;
using GameFundManager.Application.DTOs;
using GameFundManager.Core.Entities;

namespace GameFundManager.Application.Interfaces
{
    public interface IExpenseService
    {
        Task<ApiResponse<IEnumerable<ExpenseDto>>> GetGroupExpensesAsync(Guid groupId);
        Task<ApiResponse<IEnumerable<ExpenseDto>>> GetExpensesByStatusAsync(Guid groupId, ExpenseStatus status);
        Task<ApiResponse<ExpenseDto>> GetExpenseByIdAsync(Guid id);
        Task<ApiResponse<ExpenseDto>> CreateExpenseAsync(CreateExpenseDto expenseDto, Guid userId);
        Task<ApiResponse<ExpenseDto>> UpdateExpenseStatusAsync(Guid id, ExpenseStatus status, Guid userId);
        Task<ApiResponse<bool>> DeleteExpenseAsync(Guid id, Guid userId);
    }
}
