using GameFundManager.Core.Entities;
using GameFundManager.Core.Interfaces;
using GameFundManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GameFundManager.Infrastructure.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());
    }    public async Task<IEnumerable<Group>> GetUserGroupsAsync(Guid userId)
    {
        var user = await _context.Users
            .Include(u => u.Memberships)
            .ThenInclude(gm => gm.Group)
            .FirstOrDefaultAsync(u => u.Id == userId);
            
        if (user == null)
            return Enumerable.Empty<Group>();
            
        return user.Memberships
            .Where(gm => gm.IsActive)
            .Select(gm => gm.Group)
            .ToList();
    }
    
    public async Task<IEnumerable<User>> SearchUsersAsync(string searchTerm, int maxResults = 10)
    {
        searchTerm = searchTerm.ToLower();
        
        return await _dbSet
            .Where(u => 
                u.FirstName.ToLower().Contains(searchTerm) || 
                u.LastName.ToLower().Contains(searchTerm) || 
                u.Email.ToLower().Contains(searchTerm) ||
                (u.Username != null && u.Username.ToLower().Contains(searchTerm)))
            .Take(maxResults)
            .ToListAsync();
    }
}
