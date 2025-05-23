using GameFundManager.Application.Common;
using GameFundManager.Application.DTOs;

namespace GameFundManager.Application.Interfaces;

public interface IGroupService
{
    Task<ApiResponse<IEnumerable<GroupDto>>> GetAllGroupsAsync();
    Task<ApiResponse<GroupDto>> GetGroupByIdAsync(Guid id);
    Task<ApiResponse<IEnumerable<GroupDto>>> GetUserGroupsAsync(Guid userId);
    Task<ApiResponse<GroupDto>> CreateGroupAsync(CreateGroupDto groupDto, Guid userId);
    Task<ApiResponse<GroupDto>> UpdateGroupAsync(Guid id, CreateGroupDto groupDto, Guid userId);
    Task<ApiResponse<bool>> DeleteGroupAsync(Guid id, Guid userId);    Task<ApiResponse<IEnumerable<GroupMemberDto>>> GetGroupMembersAsync(Guid groupId);
    Task<ApiResponse<GroupMemberDto>> AddMemberToGroupAsync(Guid groupId, AddGroupMemberDto memberDto, Guid userId);
    Task<ApiResponse<bool>> RemoveMemberFromGroupAsync(Guid groupId, Guid memberId, Guid userId);
    Task<ApiResponse<bool>> UpdateMemberRoleAsync(Guid groupId, Guid memberId, bool isAdmin, Guid userId);
    Task<ApiResponse<bool>> PauseMemberContributionAsync(Guid groupId, PauseMemberContributionDto pauseDto, Guid userId);
    Task<ApiResponse<bool>> ResumeMemberContributionAsync(Guid groupId, Guid memberId, Guid userId);
}
