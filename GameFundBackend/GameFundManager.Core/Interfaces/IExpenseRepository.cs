using GameFundManager.Core.Entities;

namespace GameFundManager.Core.Interfaces
{
    public interface IExpenseRepository : IRepository<Expense>
    {
        Task<IEnumerable<Expense>> GetExpensesByStatusAsync(Guid groupId, ExpenseStatus status);
    }
}
