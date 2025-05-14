using GameFundManager.Application.Common;
using GameFundManager.Application.DTOs;

namespace GameFundManager.Application.Interfaces;

public interface IPollService
{
    Task<ApiResponse<IEnumerable<PollDto>>> GetGroupPollsAsync(Guid groupId);
    Task<ApiResponse<PollDto>> GetPollByIdAsync(Guid id);
    Task<ApiResponse<PollDto>> CreatePollAsync(CreatePollDto pollDto, Guid userId);
    Task<ApiResponse<PollDto>> SubmitVoteAsync(SubmitPollVoteDto voteDto, Guid userId);
    Task<ApiResponse<bool>> DeletePollAsync(Guid id, Guid userId);
}
