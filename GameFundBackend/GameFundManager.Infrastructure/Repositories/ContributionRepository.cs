using GameFundManager.Core.Entities;
using GameFundManager.Core.Interfaces;
using GameFundManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GameFundManager.Infrastructure.Repositories
{
    public class ContributionRepository : Repository<Contribution>, IContributionRepository
    {
        public ContributionRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Contribution>> GetUserContributionsAsync(Guid userId)
        {
            return await _context.Contributions
                .Include(c => c.Group)
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.ContributionDate)
                .ToListAsync();
        }

        public async Task<decimal> GetUserTotalContributionsAsync(Guid userId, Guid groupId)
        {
            return await _context.Contributions
                .Where(c => c.UserId == userId && c.GroupId == groupId)
                .SumAsync(c => c.Amount);
        }
    }
}
