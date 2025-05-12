using GameFundManager.Core.Entities;

namespace GameFundManager.Core.Interfaces
{
    public interface IPollRepository : IRepository<Poll>
    {
        Task<Poll?> GetPollWithOptionsAsync(Guid pollId);
        Task<IEnumerable<PollVote>> GetPollVotesAsync(Guid pollId);
        Task<bool> HasUserVotedAsync(Guid pollId, Guid userId);
    }
}
