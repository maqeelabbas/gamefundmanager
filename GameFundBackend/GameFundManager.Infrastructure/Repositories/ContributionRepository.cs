using GameFundManager.Core.Entities;
using GameFundManager.Core.Interfaces;
using GameFundManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GameFundManager.Infrastructure.Repositories;

public class ContributionRepository : Repository<Contribution>, IContributionRepository
{
    public ContributionRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Contribution>> GetUserContributionsAsync(Guid contributorUserId)
    {
        return await _context.Contributions
            .Include(c => c.Group)
            .Where(c => c.ContributorUserId == contributorUserId)
            .OrderByDescending(c => c.ContributionDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Contribution>> GetGroupContributionsByUserAsync(Guid groupId, Guid contributorUserId)
    {
        return await _context.Contributions
            .Include(c => c.ContributorUser)
            .Where(c => c.GroupId == groupId && c.ContributorUserId == contributorUserId)
            .OrderByDescending(c => c.ContributionDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Contribution>> GetGroupContributionsAsync(Guid groupId)
    {
        return await _context.Contributions
            .Include(c => c.ContributorUser)
            .Where(c => c.GroupId == groupId)
            .OrderByDescending(c => c.ContributionDate)
            .ToListAsync();
    }

    public async Task<Contribution?> GetContributionByIdAsync(Guid contributionId)
    {
        return await _context.Contributions
            .Include(c => c.ContributorUser)
            .Include(c => c.Group)
            .Include(c => c.CreatedByUser)
            .FirstOrDefaultAsync(c => c.Id == contributionId);
    }

    public async Task<decimal> GetUserTotalContributionsAsync(Guid contributorUserId, Guid groupId)
    {
        return await _context.Contributions
            .Where(c => c.ContributorUserId == contributorUserId && c.GroupId == groupId)
            .SumAsync(c => c.Amount);
    }

    public async Task<decimal> GetGroupTotalContributionsAsync(Guid groupId)
    {
        return await _context.Contributions
            .Where(c => c.GroupId == groupId)
            .SumAsync(c => c.Amount);
    }

    public async Task<decimal> GetGroupTotalContributionsByUserAsync(Guid groupId, Guid contributorUserId)
    {
        return await _context.Contributions
            .Where(c => c.GroupId == groupId && c.ContributorUserId == contributorUserId)
            .SumAsync(c => c.Amount);
    }

    public async Task<IEnumerable<Contribution>> GetGroupContributionsByUserAndStatusAsync(Guid groupId, Guid contributorUserId, ContributionStatus status)
    {
        return await _context.Contributions
            .Include(c => c.ContributorUser)
            .Where(c => c.GroupId == groupId && c.ContributorUserId == contributorUserId && c.Status == status)
            .OrderByDescending(c => c.ContributionDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Contribution>> GetContributionsByStatusAsync(Guid groupId, ContributionStatus status)
    {
        return await _context.Contributions
            .Include(c => c.ContributorUser)
            .Where(c => c.GroupId == groupId && c.Status == status)
            .OrderByDescending(c => c.ContributionDate)
            .ToListAsync();
    }

    public override async Task<Contribution?> GetByIdAsync(Guid id)
    {
        return await _context.Contributions
            .Include(c => c.ContributorUser)
            .Include(c => c.Group)
            .Include(c => c.CreatedByUser)
            .FirstOrDefaultAsync(c => c.Id == id);
    }
}
