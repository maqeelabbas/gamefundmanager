using GameFundManager.Core.Entities;
using GameFundManager.Core.Interfaces;
using GameFundManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GameFundManager.Infrastructure.Repositories;

public class PollRepository : Repository<Poll>, IPollRepository
{
    public PollRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Poll?> GetPollWithOptionsAsync(Guid pollId)
    {
        return await _context.Polls
            .Include(p => p.Options)
            .Include(p => p.Votes)
            .ThenInclude(v => v.User)
            .FirstOrDefaultAsync(p => p.Id == pollId);
    }

    public async Task<IEnumerable<PollVote>> GetPollVotesAsync(Guid pollId)
    {
        return await _context.PollVotes
            .Include(pv => pv.User)
            .Include(pv => pv.PollOption)
            .Where(pv => pv.PollId == pollId)
            .ToListAsync();
    }

    public async Task<bool> HasUserVotedAsync(Guid pollId, Guid userId)
    {
        return await _context.PollVotes
            .AnyAsync(pv => pv.PollId == pollId && pv.UserId == userId);
    }
}
