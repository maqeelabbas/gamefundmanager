using GameFundManager.Application.Common;
using GameFundManager.Application.DTOs;

namespace GameFundManager.Application.Interfaces
{
    public interface IContributionService
    {
        Task<ApiResponse<IEnumerable<ContributionDto>>> GetGroupContributionsAsync(Guid groupId);
        Task<ApiResponse<IEnumerable<ContributionDto>>> GetUserContributionsAsync(Guid userId);
        Task<ApiResponse<ContributionDto>> GetContributionByIdAsync(Guid id);
        Task<ApiResponse<ContributionDto>> AddContributionAsync(CreateContributionDto contributionDto, Guid userId);
        Task<ApiResponse<bool>> DeleteContributionAsync(Guid id, Guid userId);
    }
}
