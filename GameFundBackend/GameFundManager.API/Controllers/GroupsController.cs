using GameFundManager.API.Swagger;
using GameFundManager.Application.DTOs;
using GameFundManager.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace GameFundManager.API.Controllers;

/// <summary>
/// Controller for managing groups and their members
/// </summary>
[Authorize]
public class GroupsController : BaseApiController
{
    private readonly IGroupService _groupService;

    public GroupsController(IGroupService groupService)
    {
        _groupService = groupService;
    }

    /// <summary>
    /// Get all groups
    /// </summary>
    /// <returns>List of all funding groups</returns>
    [HttpGet]
    [SwaggerOperation(
        Summary = "Get all groups",
        Description = "Returns a list of all funding groups in the system",
        OperationId = "GetAllGroups",
        Tags = new[] { "Groups" }
    )]
    [SwaggerResponse(200, "Groups retrieved successfully", typeof(List<GroupDto>))]
    [SwaggerResponse(401, "Unauthorized access")]
    [SwaggerResponseExample(200, "{\"success\":true,\"message\":\"Groups retrieved successfully\",\"data\":[{\"id\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"name\":\"Cricket Team\",\"description\":\"Our local Cricket team fund for equipment and tournaments\",\"logoUrl\":null,\"targetAmount\":1000.00,\"currentAmount\":180.00,\"dueDate\":\"2025-08-08T00:00:00\",\"isActive\":true,\"currency\":\"USD\",\"ownerId\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"ownerName\":\"John Doe\",\"memberCount\":3}],\"errors\":null}")]
    public async Task<IActionResult> GetAllGroups()
    {
        var response = await _groupService.GetAllGroupsAsync();
        return HandleApiResponse(response);
    }

    /// <summary>
    /// Get group by ID
    /// </summary>
    /// <param name="id">Group ID</param>
    /// <returns>Group details</returns>
    [HttpGet("{id}")]
    [SwaggerOperation(
        Summary = "Get group by ID",
        Description = "Returns detailed information about a specific group",
        OperationId = "GetGroupById",
        Tags = new[] { "Groups" }
    )]
    [SwaggerResponse(200, "Group retrieved successfully", typeof(GroupDto))]
    [SwaggerResponse(404, "Group not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    [SwaggerResponseExample(200, "{\"success\":true,\"message\":\"Group retrieved successfully\",\"data\":{\"id\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"name\":\"Cricket Team\",\"description\":\"Our local Cricket team fund for equipment and tournaments\",\"logoUrl\":null,\"targetAmount\":1000.00,\"currentAmount\":180.00,\"dueDate\":\"2025-08-08T00:00:00\",\"isActive\":true,\"currency\":\"USD\",\"ownerId\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"ownerName\":\"John Doe\",\"memberCount\":3},\"errors\":null}")]
    public async Task<IActionResult> GetGroupById(
        [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "Group ID to retrieve")]
        Guid id)
    {
        var response = await _groupService.GetGroupByIdAsync(id);
        return HandleApiResponse(response);
    }

    /// <summary>
    /// Get groups for the current user
    /// </summary>
    /// <returns>List of groups the current user belongs to</returns>
    [HttpGet("user")]
    [SwaggerOperation(
        Summary = "Get user groups",
        Description = "Returns all groups that the current authenticated user belongs to",
        OperationId = "GetUserGroups",
        Tags = new[] { "Groups" }
    )]
    [SwaggerResponse(200, "User's groups retrieved successfully", typeof(List<GroupDto>))]
    [SwaggerResponse(401, "Unauthorized access")]
    [SwaggerResponseExample(200, "{\"success\":true,\"message\":\"User groups retrieved successfully\",\"data\":[{\"id\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"name\":\"Cricket Team\",\"description\":\"Our local Cricket team fund for equipment and tournaments\",\"logoUrl\":null,\"targetAmount\":1000.00,\"currentAmount\":180.00,\"dueDate\":\"2025-08-08T00:00:00\",\"isActive\":true,\"currency\":\"USD\",\"ownerId\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"ownerName\":\"John Doe\",\"memberCount\":3}],\"errors\":null}")]
    public async Task<IActionResult> GetUserGroups()
    {
        var userId = GetCurrentUserId();
        var response = await _groupService.GetUserGroupsAsync(userId);
        return HandleApiResponse(response);
    }

    /// <summary>
    /// Create a new group
    /// </summary>
    /// <param name="groupDto">Group creation information</param>
    /// <returns>Newly created group</returns>
    [HttpPost]
    [SwaggerOperation(
        Summary = "Create new group",
        Description = "Creates a new funding group with the current user as the owner and admin",
        OperationId = "CreateGroup",
        Tags = new[] { "Groups" }
    )]
    [SwaggerResponse(201, "Group created successfully", typeof(GroupDto))]
    [SwaggerResponse(400, "Invalid group information")]
    [SwaggerResponse(401, "Unauthorized access")]
    [SwaggerResponseExample(201, "{\"success\":true,\"message\":\"Group created successfully\",\"data\":{\"id\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"name\":\"Cricket Team\",\"description\":\"Our local Cricket team fund for equipment and tournaments\",\"logoUrl\":null,\"targetAmount\":1000.00,\"currentAmount\":0.00,\"dueDate\":\"2025-08-08T00:00:00\",\"isActive\":true,\"currency\":\"USD\",\"ownerId\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"ownerName\":\"John Doe\",\"memberCount\":1},\"errors\":null}")]
    public async Task<IActionResult> CreateGroup(
        [FromBody, SwaggerExample(
            "{\"name\":\"Cricket Team\",\"description\":\"Our local Cricket team fund for equipment and tournaments\",\"targetAmount\":1000.00,\"dueDate\":\"2025-08-08T00:00:00\",\"currency\":\"USD\"}",
            "Group creation information")]
        CreateGroupDto groupDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        var response = await _groupService.CreateGroupAsync(groupDto, userId);
        return HandleApiResponse(response);
    }

    /// <summary>
    /// Update an existing group
    /// </summary>
    /// <param name="id">Group ID to update</param>
    /// <param name="groupDto">Updated group information</param>
    /// <returns>Updated group</returns>
    [HttpPut("{id}")]
    [SwaggerOperation(
        Summary = "Update group",
        Description = "Updates an existing group. Only group admins can update group information.",
        OperationId = "UpdateGroup",
        Tags = new[] { "Groups" }
    )]
    [SwaggerResponse(200, "Group updated successfully", typeof(GroupDto))]
    [SwaggerResponse(400, "Invalid group information")]
    [SwaggerResponse(403, "Not authorized to update this group")]
    [SwaggerResponse(404, "Group not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    [SwaggerResponseExample(200, "{\"success\":true,\"message\":\"Group updated successfully\",\"data\":{\"id\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"name\":\"Cricket Team Updated\",\"description\":\"Our local Cricket team fund for equipment and tournaments - updated\",\"logoUrl\":\"https://example.com/logo.png\",\"targetAmount\":1500.00,\"currentAmount\":180.00,\"dueDate\":\"2025-09-08T00:00:00\",\"isActive\":true,\"currency\":\"USD\",\"ownerId\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"ownerName\":\"John Doe\",\"memberCount\":3},\"errors\":null}")]
    public async Task<IActionResult> UpdateGroup(
        [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "Group ID to update")]
        Guid id,
        [FromBody, SwaggerExample(
            "{\"name\":\"Cricket Team Updated\",\"description\":\"Our local Cricket team fund for equipment and tournaments - updated\",\"logoUrl\":\"https://example.com/logo.png\",\"targetAmount\":1500.00,\"dueDate\":\"2025-09-08T00:00:00\",\"currency\":\"USD\"}",
            "Updated group information")]
        CreateGroupDto groupDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        var response = await _groupService.UpdateGroupAsync(id, groupDto, userId);
        return HandleApiResponse(response);
    }

    /// <summary>
    /// Delete a group
    /// </summary>
    /// <param name="id">Group ID to delete</param>
    /// <returns>Success or failure message</returns>
    [HttpDelete("{id}")]
    [SwaggerOperation(
        Summary = "Delete group",
        Description = "Deletes a group. Only the group owner can delete a group.",
        OperationId = "DeleteGroup",
        Tags = new[] { "Groups" }
    )]
    [SwaggerResponse(200, "Group deleted successfully")]
    [SwaggerResponse(403, "Not authorized to delete this group")]
    [SwaggerResponse(404, "Group not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    [SwaggerResponseExample(200, "{\"success\":true,\"message\":\"Group deleted successfully\",\"data\":null,\"errors\":null}")]
    public async Task<IActionResult> DeleteGroup(
        [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "Group ID to delete")]
        Guid id)
    {
        var userId = GetCurrentUserId();
        var response = await _groupService.DeleteGroupAsync(id, userId);
        return HandleApiResponse(response);
    }

    [HttpGet("{groupId}/members")]
    [SwaggerOperation(
        Summary = "Get group members",
        Description = "Returns a list of all members in the specified group",
        OperationId = "GetGroupMembers",
        Tags = new[] { "Groups" }
    )]
    [SwaggerResponse(200, "Group members retrieved successfully", typeof(List<GroupMemberDto>))]
    [SwaggerResponse(404, "Group not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> GetGroupMembers(Guid groupId)
    {
        var response = await _groupService.GetGroupMembersAsync(groupId);
        return HandleApiResponse(response);
    }

    [HttpPost("{groupId}/members")]
    [SwaggerOperation(
        Summary = "Add member to group",
        Description = "Adds a user as a member to the specified group. Only group admins can add members.",
        OperationId = "AddGroupMember",
        Tags = new[] { "Groups" }
    )]
    [SwaggerResponse(201, "Member added successfully", typeof(GroupMemberDto))]
    [SwaggerResponse(400, "Invalid member information")]
    [SwaggerResponse(403, "Not authorized to add members to this group")]
    [SwaggerResponse(404, "Group or user not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> AddGroupMember(Guid groupId, [FromBody] AddGroupMemberDto memberDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        var response = await _groupService.AddMemberToGroupAsync(groupId, memberDto, userId);
        return HandleApiResponse(response);
    }

    [HttpDelete("{groupId}/members/{memberId}")]
    [SwaggerOperation(
        Summary = "Remove member from group",
        Description = "Removes a member from the specified group. Only group admins can remove members.",
        OperationId = "RemoveGroupMember",
        Tags = new[] { "Groups" }
    )]
    [SwaggerResponse(200, "Member removed successfully")]
    [SwaggerResponse(403, "Not authorized to remove members from this group")]
    [SwaggerResponse(404, "Group or member not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> RemoveGroupMember(Guid groupId, Guid memberId)
    {
        var userId = GetCurrentUserId();
        var response = await _groupService.RemoveMemberFromGroupAsync(groupId, memberId, userId);
        return HandleApiResponse(response);
    }

    [HttpPatch("{groupId}/members/{memberId}/role")]
    [SwaggerOperation(
        Summary = "Update member role",
        Description = "Updates a member's admin status in the specified group. Only group admins can update roles.",
        OperationId = "UpdateMemberRole",
        Tags = new[] { "Groups" }
    )]
    [SwaggerResponse(200, "Member role updated successfully")]
    [SwaggerResponse(403, "Not authorized to update roles in this group")]
    [SwaggerResponse(404, "Group or member not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> UpdateMemberRole(Guid groupId, Guid memberId, [FromQuery] bool isAdmin)
    {
        var userId = GetCurrentUserId();
        var response = await _groupService.UpdateMemberRoleAsync(groupId, memberId, isAdmin, userId);
        return HandleApiResponse(response);
    }

    [HttpPost("{groupId}/members/pause-contribution")]
    [SwaggerOperation(
        Summary = "Pause member contribution",
        Description = "Temporarily pauses a member's contribution to the group. Only group admins can pause contributions.",
        OperationId = "PauseMemberContribution",
        Tags = new[] { "Groups" }
    )]
    [SwaggerResponse(200, "Contribution paused successfully")]
    [SwaggerResponse(400, "Invalid pause information")]
    [SwaggerResponse(403, "Not authorized to modify contributions in this group")]
    [SwaggerResponse(404, "Group or member not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> PauseMemberContribution(Guid groupId, [FromBody] PauseMemberContributionDto pauseDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        var response = await _groupService.PauseMemberContributionAsync(groupId, pauseDto, userId);
        return HandleApiResponse(response);
    }

    [HttpPost("{groupId}/members/{memberId}/resume-contribution")]
    [SwaggerOperation(
        Summary = "Resume member contribution",
        Description = "Resumes a previously paused member's contribution to the group. Only group admins can resume contributions.",
        OperationId = "ResumeMemberContribution",
        Tags = new[] { "Groups" }
    )]
    [SwaggerResponse(200, "Contribution resumed successfully")]
    [SwaggerResponse(403, "Not authorized to modify contributions in this group")]
    [SwaggerResponse(404, "Group or member not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> ResumeMemberContribution(Guid groupId, Guid memberId)
    {
        var userId = GetCurrentUserId();
        var response = await _groupService.ResumeMemberContributionAsync(groupId, memberId, userId);
        return HandleApiResponse(response);
    }
}
