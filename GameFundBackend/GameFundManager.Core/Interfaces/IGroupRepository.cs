using GameFundManager.Core.Entities;

namespace GameFundManager.Core.Interfaces
{
    public interface IGroupRepository : IRepository<Group>
    {
        Task<Group?> GetGroupWithMembersAsync(Guid groupId);
        Task<IEnumerable<User>> GetGroupMembersAsync(Guid groupId);
        Task<IEnumerable<Contribution>> GetGroupContributionsAsync(Guid groupId);
        Task<IEnumerable<Expense>> GetGroupExpensesAsync(Guid groupId);
        Task<decimal> GetTotalContributionsAsync(Guid groupId);
        Task<decimal> GetTotalExpensesAsync(Guid groupId);
    }
}
