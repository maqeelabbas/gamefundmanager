using GameFundManager.Core.Entities;

namespace GameFundManager.Core.Interfaces
{    public interface IContributionRepository : IRepository<Contribution>
    {
        Task<IEnumerable<Contribution>> GetUserContributionsAsync(Guid contributorUserId);
        Task<IEnumerable<Contribution>> GetGroupContributionsAsync(Guid groupId);
        Task<IEnumerable<Contribution>> GetGroupContributionsByUserAsync(Guid groupId, Guid contributorUserId);
        Task<Contribution?> GetContributionByIdAsync(Guid contributionId);
        Task<decimal> GetUserTotalContributionsAsync(Guid contributorUserId, Guid groupId);
        Task<decimal> GetGroupTotalContributionsAsync(Guid groupId);
        Task<decimal> GetGroupTotalContributionsByUserAsync(Guid groupId, Guid contributorUserId);
        Task<IEnumerable<Contribution>> GetContributionsByStatusAsync(Guid groupId, ContributionStatus status);
        Task<IEnumerable<Contribution>> GetGroupContributionsByUserAndStatusAsync(Guid groupId, Guid contributorUserId, ContributionStatus status);
    }
}
