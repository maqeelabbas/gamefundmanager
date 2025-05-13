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
        }        public async Task<ApiResponse<ContributionDto>> AddContributionAsync(CreateContributionDto contributionDto, Guid userId)
        {
            // Check if group exists
            var group = await _groupRepository.GetGroupWithMembersAsync(contributionDto.GroupId);
            
            if (group == null)
                return ApiResponse<ContributionDto>.FailureResponse("Group not found");
                
            // Check if logged-in user is a member of the group
            var currentUserIsMember = group.Members.Any(m => m.UserId == userId && m.IsActive);
            
            if (!currentUserIsMember)
                return ApiResponse<ContributionDto>.FailureResponse("You are not a member of this group");
            
            // Determine the contributor user ID
            Guid contributorUserId = userId; // Default: creator is also the contributor
            
            // If creating a contribution for another user
            if (contributionDto.ContributorUserId.HasValue && contributionDto.ContributorUserId.Value != userId)
            {
                // Check if the user has admin privileges to create contributions for others
                bool isAdminOrOwner = group.OwnerId == userId || 
                                     group.Members.Any(m => m.UserId == userId && m.IsAdmin && m.IsActive);
                
                if (!isAdminOrOwner)
                    return ApiResponse<ContributionDto>.FailureResponse("You don't have permission to add contributions for other users");
                
                // Verify the target contributor is a member of the group
                bool contributorIsMember = group.Members.Any(m => m.UserId == contributionDto.ContributorUserId && m.IsActive);
                
                if (!contributorIsMember)
                    return ApiResponse<ContributionDto>.FailureResponse("The specified user is not a member of this group");
                
                contributorUserId = contributionDto.ContributorUserId.Value;
            }
              // Create contribution entity
            var contribution = _mapper.Map<Contribution>(contributionDto);
            contribution.ContributorUserId = contributorUserId;      // User who is making the payment
            contribution.CreatedByUserId = userId;        // User who created the record
            
            await _contributionRepository.AddAsync(contribution);
            await _contributionRepository.SaveChangesAsync();
            
            var result = _mapper.Map<ContributionDto>(contribution);
            return ApiResponse<ContributionDto>.SuccessResponse(result, "Contribution added successfully");
        }public async Task<ApiResponse<bool>> DeleteContributionAsync(Guid id, Guid userId)
        {
            var contribution = await _contributionRepository.GetByIdAsync(id);
            
            if (contribution == null)
                return ApiResponse<bool>.FailureResponse("Contribution not found");
                  // Only the contributor or group owner can delete a contribution
            if (contribution.ContributorUserId != userId)
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
        
        public async Task<ApiResponse<IEnumerable<ContributionDto>>> GetContributionsByStatusAsync(Guid groupId, ContributionStatus status)
        {
            var group = await _groupRepository.GetByIdAsync(groupId);
            
            if (group == null)
                return ApiResponse<IEnumerable<ContributionDto>>.FailureResponse("Group not found");
                
            var contributions = await _contributionRepository.GetContributionsByStatusAsync(groupId, status);
            var contributionDtos = _mapper.Map<IEnumerable<ContributionDto>>(contributions);
            
            return ApiResponse<IEnumerable<ContributionDto>>.SuccessResponse(contributionDtos);
        }
        
        public async Task<ApiResponse<ContributionDto>> UpdateContributionStatusAsync(Guid id, ContributionStatus status, Guid userId)
        {
            var contribution = await _contributionRepository.GetByIdAsync(id);
            
            if (contribution == null)
                return ApiResponse<ContributionDto>.FailureResponse("Contribution not found");
                
            // Check if user is authorized to update status            // Only the contributor, group owner or admin can update contribution status
            if (contribution.ContributorUserId != userId)
            {
                var group = await _groupRepository.GetGroupWithMembersAsync(contribution.GroupId);
                
                if (group == null)
                    return ApiResponse<ContributionDto>.FailureResponse("Group not found");
                    
                var isAuthorized = group.OwnerId == userId ||
                                  group.Members.Any(m => m.UserId == userId && m.IsAdmin && m.IsActive);
                                  
                if (!isAuthorized)
                    return ApiResponse<ContributionDto>.FailureResponse("You don't have permission to update this contribution status");
            }
            
            // Update status
            contribution.Status = status;
            
            await _contributionRepository.UpdateAsync(contribution);
            await _contributionRepository.SaveChangesAsync();
            
            var contributionDto = _mapper.Map<ContributionDto>(contribution);
            return ApiResponse<ContributionDto>.SuccessResponse(contributionDto, $"Contribution status updated to {status}");
        }

        public async Task<ApiResponse<IEnumerable<ContributionDto>>> GetGroupContributionsByUserAndStatusAsync(Guid groupId, Guid userId, ContributionStatus status)
        {
            var group = await _groupRepository.GetByIdAsync(groupId);

            if (group == null)
                return ApiResponse<IEnumerable<ContributionDto>>.FailureResponse("Group not found");

            var contributions = await _contributionRepository.GetGroupContributionsByUserAndStatusAsync(groupId, userId, status);
            var contributionDtos = _mapper.Map<IEnumerable<ContributionDto>>(contributions);

            return ApiResponse<IEnumerable<ContributionDto>>.SuccessResponse(contributionDtos);
        }
    }
}
