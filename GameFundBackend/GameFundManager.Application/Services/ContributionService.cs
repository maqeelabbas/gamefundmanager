using AutoMapper;
using GameFundManager.Application.Common;
using GameFundManager.Application.DTOs;
using GameFundManager.Application.Interfaces;
using GameFundManager.Core.Entities;
using GameFundManager.Core.Interfaces;

namespace GameFundManager.Application.Services
{
    public class ContributionService : IContributionService
    {
        private readonly IContributionRepository _contributionRepository;
        private readonly IGroupRepository _groupRepository;
        private readonly IMapper _mapper;

        public ContributionService(
            IContributionRepository contributionRepository,
            IGroupRepository groupRepository,
            IMapper mapper)
        {
            _contributionRepository = contributionRepository;
            _groupRepository = groupRepository;
            _mapper = mapper;
        }

        public async Task<ApiResponse<IEnumerable<ContributionDto>>> GetGroupContributionsAsync(Guid groupId)
        {
            var group = await _groupRepository.GetByIdAsync(groupId);
            
            if (group == null)
                return ApiResponse<IEnumerable<ContributionDto>>.FailureResponse("Group not found");
                
            var contributions = await _groupRepository.GetGroupContributionsAsync(groupId);
            var contributionDtos = _mapper.Map<IEnumerable<ContributionDto>>(contributions);
            
            return ApiResponse<IEnumerable<ContributionDto>>.SuccessResponse(contributionDtos);
        }

        public async Task<ApiResponse<IEnumerable<ContributionDto>>> GetUserContributionsAsync(Guid userId)
        {
            var contributions = await _contributionRepository.GetUserContributionsAsync(userId);
            var contributionDtos = _mapper.Map<IEnumerable<ContributionDto>>(contributions);
            
            return ApiResponse<IEnumerable<ContributionDto>>.SuccessResponse(contributionDtos);
        }

        public async Task<ApiResponse<ContributionDto>> GetContributionByIdAsync(Guid id)
        {
            var contribution = await _contributionRepository.GetByIdAsync(id);
            
            if (contribution == null)
                return ApiResponse<ContributionDto>.FailureResponse("Contribution not found");
                
            var contributionDto = _mapper.Map<ContributionDto>(contribution);
            return ApiResponse<ContributionDto>.SuccessResponse(contributionDto);
        }

        public async Task<ApiResponse<ContributionDto>> AddContributionAsync(CreateContributionDto contributionDto, Guid userId)
        {
            // Check if group exists
            var group = await _groupRepository.GetGroupWithMembersAsync(contributionDto.GroupId);
            
            if (group == null)
                return ApiResponse<ContributionDto>.FailureResponse("Group not found");
                
            // Check if user is a member of the group
            var isMember = group.Members.Any(m => m.UserId == userId && m.IsActive);
            
            if (!isMember)
                return ApiResponse<ContributionDto>.FailureResponse("You are not a member of this group");
                
            // Create contribution entity
            var contribution = _mapper.Map<Contribution>(contributionDto);
            contribution.UserId = userId;
            
            await _contributionRepository.AddAsync(contribution);
            await _contributionRepository.SaveChangesAsync();
            
            var result = _mapper.Map<ContributionDto>(contribution);
            return ApiResponse<ContributionDto>.SuccessResponse(result, "Contribution added successfully");
        }

        public async Task<ApiResponse<bool>> DeleteContributionAsync(Guid id, Guid userId)
        {
            var contribution = await _contributionRepository.GetByIdAsync(id);
            
            if (contribution == null)
                return ApiResponse<bool>.FailureResponse("Contribution not found");
                
            // Only the contributor or group owner can delete a contribution
            if (contribution.UserId != userId)
            {
                var group = await _groupRepository.GetByIdAsync(contribution.GroupId);
                if (group == null || group.OwnerId != userId)
                {
                    // Check if user is an admin of the group
                    var isAdmin = group?.Members.Any(m => m.UserId == userId && m.IsAdmin) ?? false;
                    
                    if (!isAdmin)
                        return ApiResponse<bool>.FailureResponse("You don't have permission to delete this contribution");
                }
            }
            
            await _contributionRepository.DeleteAsync(id);
            await _contributionRepository.SaveChangesAsync();
            
            return ApiResponse<bool>.SuccessResponse(true, "Contribution deleted successfully");
        }
    }
}
