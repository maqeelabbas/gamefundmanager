using GameFundManager.Application.Common;
using GameFundManager.Application.DTOs;
using GameFundManager.Core.Entities;

namespace GameFundManager.Application.Interfaces
{
    public interface IContributionService
    {
        Task<ApiResponse<IEnumerable<ContributionDto>>> GetGroupContributionsAsync(Guid groupId);
        Task<ApiResponse<IEnumerable<ContributionDto>>> GetUserContributionsAsync(Guid userId);
        Task<ApiResponse<ContributionDto>> GetContributionByIdAsync(Guid id);
        Task<ApiResponse<ContributionDto>> AddContributionAsync(CreateContributionDto contributionDto, Guid userId);
        Task<ApiResponse<bool>> DeleteContributionAsync(Guid id, Guid userId);
        Task<ApiResponse<IEnumerable<ContributionDto>>> GetContributionsByStatusAsync(Guid groupId, ContributionStatus status);
        Task<ApiResponse<ContributionDto>> UpdateContributionStatusAsync(Guid id, ContributionStatus status, Guid userId);
        Task<ApiResponse<IEnumerable<ContributionDto>>> GetGroupContributionsByUserAndStatusAsync(Guid groupId, Guid userId, ContributionStatus status);
    }
}
