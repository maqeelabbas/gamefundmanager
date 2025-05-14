using GameFundManager.Core.Entities;
using GameFundManager.Core.Interfaces;
using GameFundManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GameFundManager.Infrastructure.Repositories;

public class ExpenseRepository : Repository<Expense>, IExpenseRepository
{
    public ExpenseRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Expense>> GetUserExpensesAsync(Guid paidByUserId)
    {
        return await _context.Expenses
            .Include(e => e.Group)
            .Where(e => e.PaidByUserId == paidByUserId)
            .OrderByDescending(e => e.ExpenseDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Expense>> GetGroupExpensesByUserAsync(Guid groupId, Guid userId)
    {
        return await _context.Expenses
            .Include(e => e.CreatedByUser)
            .Include(e => e.PaidByUser)
            .Where(e => e.GroupId == groupId && e.CreatedByUserId == userId)
            .OrderByDescending(e => e.ExpenseDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Expense>> GetGroupExpensesAsync(Guid groupId)
    {
        return await _context.Expenses
            .Include(e => e.CreatedByUser)
            .Include(e => e.PaidByUser)
            .Where(e => e.GroupId == groupId)
            .OrderByDescending(e => e.ExpenseDate)
            .ToListAsync();
    }

    public override async Task<Expense?> GetByIdAsync(Guid id)
    {
        return await _context.Expenses
            .Include(e => e.CreatedByUser)
            .Include(e => e.PaidByUser)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<IEnumerable<Expense>> GetExpensesByStatusAsync(Guid groupId, ExpenseStatus status)
    {
        return await _context.Expenses
            .Include(e => e.CreatedByUser)
            .Include(e => e.PaidByUser)  // Add this to include PaidByUser
            .Where(e => e.GroupId == groupId && e.Status == status)
            .OrderByDescending(e => e.ExpenseDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Expense>> GetGroupExpensesByUserAndStatusAsync(Guid groupId, Guid userId, ExpenseStatus status)
    {
        return await _context.Expenses
            .Include(e => e.CreatedByUser)
            .Include(e => e.PaidByUser)  // Add this to include PaidByUser
            .Where(e => e.GroupId == groupId && e.CreatedByUserId == userId && e.Status == status)
            .OrderByDescending(e => e.ExpenseDate)
            .ToListAsync();
    }

    public async Task<Expense?> GetExpenseByIdAsync(Guid expenseId)
    {
        return await _context.Expenses
            .Include(e => e.CreatedByUser)
            .Include(e => e.PaidByUser)
            .Include(e => e.Group)
            .FirstOrDefaultAsync(e => e.Id == expenseId);
    }

    public async Task<decimal> GetUserTotalExpensesAsync(Guid paidByUserId, Guid groupId)
    {
        return await _context.Expenses
            .Where(e => e.PaidByUserId == paidByUserId && e.GroupId == groupId)
            .SumAsync(e => e.Amount);
    }

    public async Task<decimal> GetGroupTotalExpensesAsync(Guid groupId)
    {
        return await _context.Expenses
            .Where(e => e.GroupId == groupId)
            .SumAsync(e => e.Amount);
    }

    public async Task<decimal> GetGroupTotalExpensesByUserAsync(Guid groupId, Guid paidByUserId)
    {
        return await _context.Expenses
            .Where(e => e.GroupId == groupId && e.PaidByUserId == paidByUserId)
            .SumAsync(e => e.Amount);
    }
}
