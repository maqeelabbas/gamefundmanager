using AutoMapper;
using GameFundManager.Application.Common;
using GameFundManager.Application.DTOs;
using GameFundManager.Application.Interfaces;
using GameFundManager.Core.Entities;
using GameFundManager.Core.Interfaces;

namespace GameFundManager.Application.Services
{
    public class GroupService : IGroupService
    {
        private readonly IGroupRepository _groupRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public GroupService(IGroupRepository groupRepository, IUserRepository userRepository, IMapper mapper)
        {
            _groupRepository = groupRepository;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<ApiResponse<IEnumerable<GroupDto>>> GetAllGroupsAsync()
        {
            var groups = await _groupRepository.GetAllAsync();
            var groupDtos = _mapper.Map<IEnumerable<GroupDto>>(groups).ToList();
            
            foreach (var groupDto in groupDtos)
            {
                groupDto.TotalContributions = await _groupRepository.GetTotalContributionsAsync(groupDto.Id);
                groupDto.TotalExpenses = await _groupRepository.GetTotalExpensesAsync(groupDto.Id);
            }
            
            return ApiResponse<IEnumerable<GroupDto>>.SuccessResponse(groupDtos);
        }

        public async Task<ApiResponse<GroupDto>> GetGroupByIdAsync(Guid id)
        {
            var group = await _groupRepository.GetGroupWithMembersAsync(id);
            
            if (group == null)
                return ApiResponse<GroupDto>.FailureResponse("Group not found");
                
            var groupDto = _mapper.Map<GroupDto>(group);
            groupDto.TotalContributions = await _groupRepository.GetTotalContributionsAsync(id);
            groupDto.TotalExpenses = await _groupRepository.GetTotalExpensesAsync(id);
            
            return ApiResponse<GroupDto>.SuccessResponse(groupDto);
        }

        public async Task<ApiResponse<IEnumerable<GroupDto>>> GetUserGroupsAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            
            if (user == null)
                return ApiResponse<IEnumerable<GroupDto>>.FailureResponse("User not found");
                
            var groups = await _userRepository.GetUserGroupsAsync(userId);
            var groupDtos = _mapper.Map<IEnumerable<GroupDto>>(groups).ToList();
            
            foreach (var groupDto in groupDtos)
            {
                groupDto.TotalContributions = await _groupRepository.GetTotalContributionsAsync(groupDto.Id);
                groupDto.TotalExpenses = await _groupRepository.GetTotalExpensesAsync(groupDto.Id);
            }
            
            return ApiResponse<IEnumerable<GroupDto>>.SuccessResponse(groupDtos);
        }

        public async Task<ApiResponse<GroupDto>> CreateGroupAsync(CreateGroupDto groupDto, Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            
            if (user == null)
                return ApiResponse<GroupDto>.FailureResponse("User not found");
                
            var group = _mapper.Map<Group>(groupDto);
            group.OwnerId = userId;
            
            await _groupRepository.AddAsync(group);
            
            // Add owner as first member with admin rights
            var groupMember = new GroupMember
            {
                GroupId = group.Id,
                UserId = userId,
                IsAdmin = true
            };
            
            group.Members.Add(groupMember);
            await _groupRepository.SaveChangesAsync();
            
            var result = _mapper.Map<GroupDto>(group);
            result.Owner = _mapper.Map<UserDto>(user);
            result.TotalContributions = 0;
            result.TotalExpenses = 0;
            
            return ApiResponse<GroupDto>.SuccessResponse(result, "Group created successfully");
        }

        public async Task<ApiResponse<GroupDto>> UpdateGroupAsync(Guid id, CreateGroupDto groupDto, Guid userId)
        {
            var group = await _groupRepository.GetByIdAsync(id);
            
            if (group == null)
                return ApiResponse<GroupDto>.FailureResponse("Group not found");
                
            // Check if the user is the owner or an admin of the group
            if (group.OwnerId != userId)
            {
                var isAdmin = group.Members.Any(m => m.UserId == userId && m.IsAdmin);
                
                if (!isAdmin)
                    return ApiResponse<GroupDto>.FailureResponse("You don't have permission to update this group");
            }
            
            // Update group properties
            group.Name = groupDto.Name;
            group.Description = groupDto.Description;
            group.LogoUrl = groupDto.LogoUrl;
            group.TargetAmount = groupDto.TargetAmount;
            group.DueDate = groupDto.DueDate;
            group.Currency = groupDto.Currency;
            
            await _groupRepository.UpdateAsync(group);
            await _groupRepository.SaveChangesAsync();
            
            // Get updated group with members
            group = await _groupRepository.GetGroupWithMembersAsync(id);
            var groupDto2 = _mapper.Map<GroupDto>(group);
            groupDto2.TotalContributions = await _groupRepository.GetTotalContributionsAsync(id);
            groupDto2.TotalExpenses = await _groupRepository.GetTotalExpensesAsync(id);
            
            return ApiResponse<GroupDto>.SuccessResponse(groupDto2, "Group updated successfully");
        }

        public async Task<ApiResponse<bool>> DeleteGroupAsync(Guid id, Guid userId)
        {
            var group = await _groupRepository.GetByIdAsync(id);
            
            if (group == null)
                return ApiResponse<bool>.FailureResponse("Group not found");
                
            // Only the owner can delete the group
            if (group.OwnerId != userId)
                return ApiResponse<bool>.FailureResponse("You don't have permission to delete this group");
                
            await _groupRepository.DeleteAsync(id);
            await _groupRepository.SaveChangesAsync();
            
            return ApiResponse<bool>.SuccessResponse(true, "Group deleted successfully");
        }

        public async Task<ApiResponse<IEnumerable<GroupMemberDto>>> GetGroupMembersAsync(Guid groupId)
        {
            var group = await _groupRepository.GetGroupWithMembersAsync(groupId);
            
            if (group == null)
                return ApiResponse<IEnumerable<GroupMemberDto>>.FailureResponse("Group not found");
                
            var members = _mapper.Map<IEnumerable<GroupMemberDto>>(group.Members);
            
            return ApiResponse<IEnumerable<GroupMemberDto>>.SuccessResponse(members);
        }

        public async Task<ApiResponse<GroupMemberDto>> AddMemberToGroupAsync(AddGroupMemberDto memberDto, Guid currentUserId)
        {
            var group = await _groupRepository.GetGroupWithMembersAsync(memberDto.GroupId);
            
            if (group == null)
                return ApiResponse<GroupMemberDto>.FailureResponse("Group not found");
                
            // Check if the current user is owner or admin
            if (group.OwnerId != currentUserId)
            {
                var isAdmin = group.Members.Any(m => m.UserId == currentUserId && m.IsAdmin);
                
                if (!isAdmin)
                    return ApiResponse<GroupMemberDto>.FailureResponse("You don't have permission to add members to this group");
            }
            
            // Check if user exists
            var user = await _userRepository.GetByIdAsync(memberDto.UserId);
            
            if (user == null)
                return ApiResponse<GroupMemberDto>.FailureResponse("User not found");
                
            // Check if user is already a member
            var existingMembership = group.Members.FirstOrDefault(m => m.UserId == memberDto.UserId);
            
            if (existingMembership != null)
            {
                // If the user is already a member but inactive, reactivate them
                if (!existingMembership.IsActive)
                {
                    existingMembership.IsActive = true;
                    existingMembership.IsAdmin = memberDto.IsAdmin;
                    existingMembership.ContributionQuota = memberDto.ContributionQuota;
                    
                    await _groupRepository.SaveChangesAsync();
                    
                    var memberDto2 = _mapper.Map<GroupMemberDto>(existingMembership);
                    memberDto2.User = _mapper.Map<UserDto>(user);
                    
                    return ApiResponse<GroupMemberDto>.SuccessResponse(memberDto2, "User was reactivated as a member");
                }
                
                return ApiResponse<GroupMemberDto>.FailureResponse("User is already a member of this group");
            }
            
            // Add user to group
            var groupMember = _mapper.Map<GroupMember>(memberDto);
              group.Members.Add(groupMember);
            await _groupRepository.SaveChangesAsync();
            
            var result = _mapper.Map<GroupMemberDto>(groupMember);
            result.User = _mapper.Map<UserDto>(user);
            
            return ApiResponse<GroupMemberDto>.SuccessResponse(result, "Member added to group successfully");
        }

        public async Task<ApiResponse<bool>> RemoveMemberFromGroupAsync(Guid groupId, Guid memberId, Guid currentUserId)
        {
            var group = await _groupRepository.GetGroupWithMembersAsync(groupId);
            
            if (group == null)
                return ApiResponse<bool>.FailureResponse("Group not found");
                
            // Check if the current user is owner or admin
            if (group.OwnerId != currentUserId)
            {
                var isAdmin = group.Members.Any(m => m.UserId == currentUserId && m.IsAdmin);
                
                if (!isAdmin)
                    return ApiResponse<bool>.FailureResponse("You don't have permission to remove members from this group");
            }
            
            // Can't remove the owner
            if (memberId == group.OwnerId)
                return ApiResponse<bool>.FailureResponse("Cannot remove the owner from the group");
                
            // Get the member to remove
            var member = group.Members.FirstOrDefault(m => m.UserId == memberId && m.IsActive);
            
            if (member == null)
                return ApiResponse<bool>.FailureResponse("Member not found in this group");
                
            // Soft delete by setting IsActive to false
            member.IsActive = false;
            
            await _groupRepository.SaveChangesAsync();
            
            return ApiResponse<bool>.SuccessResponse(true, "Member removed from group successfully");
        }
    }
}
