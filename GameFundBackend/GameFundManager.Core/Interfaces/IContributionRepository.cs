using GameFundManager.Core.Entities;

namespace GameFundManager.Core.Interfaces
{
    public interface IContributionRepository : IRepository<Contribution>
    {
        Task<IEnumerable<Contribution>> GetUserContributionsAsync(Guid userId);
        Task<decimal> GetUserTotalContributionsAsync(Guid userId, Guid groupId);
    }
}
