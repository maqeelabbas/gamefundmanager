using GameFundManager.Core.Entities;
using GameFundManager.Core.Interfaces;
using GameFundManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GameFundManager.Infrastructure.Repositories
{
    public class ExpenseRepository : Repository<Expense>, IExpenseRepository
    {
        public ExpenseRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Expense>> GetExpensesByStatusAsync(Guid groupId, ExpenseStatus status)
        {
            return await _context.Expenses
                .Include(e => e.CreatedByUser)
                .Where(e => e.GroupId == groupId && e.Status == status)
                .OrderByDescending(e => e.ExpenseDate)
                .ToListAsync();
        }
    }
}
