using GameFundManager.Core.Entities;

namespace GameFundManager.Core.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByUsernameAsync(string username);
    Task<IEnumerable<Group>> GetUserGroupsAsync(Guid userId);
}
