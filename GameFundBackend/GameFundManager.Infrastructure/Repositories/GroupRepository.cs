using GameFundManager.Core.Entities;
using GameFundManager.Core.Interfaces;
using GameFundManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GameFundManager.Infrastructure.Repositories
{
    public class GroupRepository : Repository<Group>, IGroupRepository
    {
        public GroupRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Group?> GetGroupWithMembersAsync(Guid groupId)
        {
            return await _dbSet
                .Include(g => g.Members)
                .ThenInclude(gm => gm.User)
                .Include(g => g.Owner)
                .FirstOrDefaultAsync(g => g.Id == groupId);
        }

        public async Task<IEnumerable<User>> GetGroupMembersAsync(Guid groupId)
        {
            var group = await _dbSet
                .Include(g => g.Members)
                .ThenInclude(gm => gm.User)
                .FirstOrDefaultAsync(g => g.Id == groupId);

            if (group == null)
                return Enumerable.Empty<User>();

            return group.Members
                .Where(gm => gm.IsActive)
                .Select(gm => gm.User)
                .ToList();
        }        public async Task<IEnumerable<Contribution>> GetGroupContributionsAsync(Guid groupId)
        {
            return await _context.Contributions
                .Include(c => c.ContributorUser)
                .Where(c => c.GroupId == groupId)
                .OrderByDescending(c => c.ContributionDate)
                .ToListAsync();
        }        public async Task<IEnumerable<Contribution>> GetGroupContributionsByUserAsync(Guid groupId, Guid contributorUserId)
        {
            return await _context.Contributions
                .Include(c => c.ContributorUser)
                .Where(c => c.GroupId == groupId && c.ContributorUserId == contributorUserId)
                .OrderByDescending(c => c.ContributionDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Expense>> GetGroupExpensesAsync(Guid groupId)
        {
            return await _context.Expenses
                .Include(e => e.CreatedByUser)
                .Include(e => e.PaidByUser)  // Add this to include PaidByUser
                .Where(e => e.GroupId == groupId)
                .OrderByDescending(e => e.ExpenseDate)
                .ToListAsync();
        }

        public async Task<decimal> GetTotalContributionsAsync(Guid groupId)
        {
            return await _context.Contributions
                .Where(c => c.GroupId == groupId)
                .SumAsync(c => c.Amount);
        }

        public async Task<decimal> GetTotalExpensesAsync(Guid groupId)
        {
            return await _context.Expenses
                .Where(e => e.GroupId == groupId && e.Status == ExpenseStatus.Completed)
                .SumAsync(e => e.Amount);
        }
    }
}
