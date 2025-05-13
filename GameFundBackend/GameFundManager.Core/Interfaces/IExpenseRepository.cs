using GameFundManager.Core.Entities;

namespace GameFundManager.Core.Interfaces
{
    public interface IExpenseRepository : IRepository<Expense>
    {
        Task<Expense?> GetExpenseByIdAsync(Guid expenseId);
        Task<IEnumerable<Expense>> GetExpensesByStatusAsync(Guid groupId, ExpenseStatus status);
        Task<IEnumerable<Expense>> GetGroupExpensesAsync(Guid groupId);
        Task<IEnumerable<Expense>> GetGroupExpensesByUserAsync(Guid groupId, Guid userId);
        Task<IEnumerable<Expense>> GetGroupExpensesByUserAndStatusAsync(Guid groupId, Guid userId, ExpenseStatus status);
        Task<IEnumerable<Expense>> GetUserExpensesAsync(Guid paidByUserId);
        Task<decimal> GetUserTotalExpensesAsync(Guid paidByUserId, Guid groupId);
        Task<decimal> GetGroupTotalExpensesAsync(Guid groupId);
        Task<decimal> GetGroupTotalExpensesByUserAsync(Guid groupId, Guid paidByUserId);
    }
}
