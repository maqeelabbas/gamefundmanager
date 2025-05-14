using GameFundManager.Application.DTOs;
using GameFundManager.Application.Interfaces;
using GameFundManager.API.Swagger;
using GameFundManager.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using GameFundManager.Application.Services;

namespace GameFundManager.API.Controllers;

[Authorize]
public class ContributionsController : BaseApiController
{
    private readonly IContributionService _contributionService;

    public ContributionsController(IContributionService contributionService)
    {
        _contributionService = contributionService;
    }

    /// <summary>
    /// Get a specific contribution by ID
    /// </summary>
    /// <param name="id">Contribution ID to retrieve</param>
    /// <returns>Details of the specified contribution</returns>
    [HttpGet("{id}")]
    [SwaggerOperation(
        Summary = "Get contribution by ID",
        Description = "Returns detailed information about a specific contribution",
        OperationId = "GetContributionById",
        Tags = new[] { "Contributions" }
    )]
    [SwaggerResponse(200, "Contribution retrieved successfully")]
    [SwaggerResponse(404, "Contribution not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> GetContributionById(
        [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "Contribution ID to retrieve")]
        Guid id)
    {
        var response = await _contributionService.GetContributionByIdAsync(id);
        return HandleApiResponse(response);
    }        /// <summary>
             /// Add a new contribution to a group
             /// </summary>
             /// <param name="contributionDto">Contribution details. If contributorUserId is provided, the contribution will be recorded for that user. Admins can create contributions for other users.</param>
             /// <returns>Created contribution details</returns>
    
    [HttpPost]
    [SwaggerOperation(
        Summary = "Add a contribution",
        Description = "Creates a new contribution to a group. Group admins can create contributions for other users by specifying contributorUserId.",
        OperationId = "AddContribution",
        Tags = new[] { "Contributions" }
    )]
    [SwaggerResponse(201, "Contribution added successfully")]
    [SwaggerResponse(400, "Invalid contribution information")]
    [SwaggerResponse(403, "Not authorized to add contribution for other users")]
    [SwaggerResponse(404, "Group or user not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> AddContribution(
        [FromBody, SwaggerExample(
            "{\"groupId\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"amount\":50.00,\"description\":\"Monthly contribution\",\"paymentMethod\":\"CreditCard\",\"contributorUserId\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\"}",
            "Contribution details")]
        CreateContributionDto contributionDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        var response = await _contributionService.AddContributionAsync(contributionDto, userId);
        return HandleApiResponse(response);
    }/// <summary>
     /// Delete a contribution
     /// </summary>
     /// <param name="id">Contribution ID to delete</param>
     /// <returns>Success or failure message</returns>

     /// <summary>
     /// Update the status of a contribution
     /// </summary>
     /// <param name="id">Contribution ID to update</param>
     /// <param name="status">New contribution status</param>
     /// <returns>Updated contribution details</returns>
    [HttpPut("{id}/status/{status}")]
    [SwaggerOperation(
        Summary = "Update contribution status",
        Description = "Updates the status of a contribution to Paid, Pending, Rejected, etc. Only the contribution creator or a group admin can update contribution status.",
        OperationId = "UpdateContributionStatus",
        Tags = new[] { "Contributions" }
    )]
    [SwaggerResponse(200, "Contribution status updated successfully")]
    [SwaggerResponse(403, "Not authorized to update this contribution")]
    [SwaggerResponse(404, "Contribution not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> UpdateContributionStatus(
        [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "Contribution ID to update")]
        Guid id,
        [SwaggerExample("Paid", "New contribution status (Paid, Pending, Rejected, etc.)")]
        ContributionStatus status)
    {
        var userId = GetCurrentUserId();
        var response = await _contributionService.UpdateContributionStatusAsync(id, status, userId);
        return HandleApiResponse(response);
    }

    [HttpDelete("{id}")]
    [SwaggerOperation(
        Summary = "Delete contribution",
        Description = "Deletes a contribution. Only the contribution creator or a group admin can delete contributions.",
        OperationId = "DeleteContribution",
        Tags = new[] { "Contributions" }
    )]
    [SwaggerResponse(200, "Contribution deleted successfully")]
    [SwaggerResponse(403, "Not authorized to delete this contribution")]
    [SwaggerResponse(404, "Contribution not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> DeleteContribution(
        [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "Contribution ID to delete")]
        Guid id)
    {
        var userId = GetCurrentUserId();
        var response = await _contributionService.DeleteContributionAsync(id, userId);
        return HandleApiResponse(response);
    }

    /// <summary>
    /// Get all contributions made by the current user
    /// </summary>
    /// <returns>List of contributions made by the current user</returns>
    [HttpGet("user")]
    [SwaggerOperation(
        Summary = "Get user contributions",
        Description = "Returns all contributions made by the current authenticated user",
        OperationId = "GetUserContributions",
        Tags = new[] { "Contributions" }
    )]
    [SwaggerResponse(200, "User contributions retrieved successfully")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> GetUserContributions()
    {
        var userId = GetCurrentUserId();
        var response = await _contributionService.GetUserContributionsAsync(userId);
        return HandleApiResponse(response);
    }

    /// <summary>
    /// Get all contributions made by a specific user (not just the current user)
    /// </summary>
    /// <param name="userId">ID of the user whose contributions to retrieve</param>
    /// <returns>List of contributions made by the specified user</returns>
    [HttpGet("user/{userId}")]
    [SwaggerOperation(
        Summary = "Get specific user contributions",
        Description = "Returns all contributions made by the specified user (allows admins to view other users' contributions)",
        OperationId = "GetSpecificUserContributions",
        Tags = new[] { "Contributions" }
    )]
    [SwaggerResponse(200, "User contributions retrieved successfully")]
    [SwaggerResponse(404, "User not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> GetSpecificUserContributions(
        [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "User ID to retrieve contributions for")]
        Guid userId)
    {
        var response = await _contributionService.GetUserContributionsAsync(userId);
        return HandleApiResponse(response);
    }

    /// <summary>
    /// Get all contributions for a specific group
    /// </summary>
    /// <param name="groupId">Group ID to retrieve contributions for</param>
    /// <returns>List of contributions for the specified group</returns>
    [HttpGet("group/{groupId}")]
    [SwaggerOperation(
        Summary = "Get group contributions",
        Description = "Returns all contributions made to a specific group",
        OperationId = "GetGroupContributions",
        Tags = new[] { "Contributions" }
    )]
    [SwaggerResponse(200, "Group contributions retrieved successfully")]
    [SwaggerResponse(404, "Group not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> GetGroupContributions(
        [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "Group ID to retrieve contributions for")]
        Guid groupId)
    {
        var response = await _contributionService.GetGroupContributionsAsync(groupId);
        return HandleApiResponse(response);
    }

    /// <summary>
    /// Get contributions by status for a specific group
    /// </summary>
    /// <param name="groupId">Group ID to retrieve contributions for</param>
    /// <param name="status">Contribution status to filter by</param>
    /// <returns>List of contributions with specified status</returns>
    [HttpGet("group/{groupId}/status/{status}")]
    [SwaggerOperation(
        Summary = "Get contributions by status",
        Description = "Returns contributions for a specific group filtered by status (Pending, Paid, Rejected, etc.)",
        OperationId = "GetContributionsByStatus",
        Tags = new[] { "Contributions" }
    )]
    [SwaggerResponse(200, "Filtered contributions retrieved successfully")]
    [SwaggerResponse(404, "Group not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> GetContributionsByStatus(
        [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "Group ID to retrieve contributions for")]
        Guid groupId,
        [SwaggerExample("Pending", "Contribution status (Pending, Paid, Rejected, etc.)")]
        ContributionStatus status)
    {
        var response = await _contributionService.GetContributionsByStatusAsync(groupId, status);
        return HandleApiResponse(response);
    }


    /// <summary>
    /// Get contributions created by a specific user in a group
    /// </summary>
    /// <param name="groupId">Group ID to retrieve contributions for</param>
    /// <param name="userId">User ID who created the contributions</param>
    /// <returns>List of contributions created by the specified user in the group</returns>
    [HttpGet("group/{groupId}/user/{userId}")]
    [SwaggerOperation(
        Summary = "Get contributions by user",
        Description = "Returns contributions created by a specific user in a group",
        OperationId = "GetGroupContributionsByUser",
        Tags = new[] { "Contributions" }
    )]
    [SwaggerResponse(200, "User's contributions retrieved successfully")]
    [SwaggerResponse(404, "Group not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> GetGroupContributionsByUser(
        [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "Group ID to retrieve contributions for")]
        Guid groupId,
        [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "User ID who created the contributions")]
        Guid userId)
    {
        var response = await _contributionService.GetGroupContributionsByUserAsync(groupId, userId);
        return HandleApiResponse(response);
    }

    /// <summary>
    /// Get contributions created by a specific user in a group with a specific status
    /// </summary>
    /// <param name="groupId">Group ID to retrieve contributions for</param>
    /// <param name="userId">User ID who created the contributions</param>
    /// <param name="status">Contribution status to filter by</param>
    /// <returns>List of contributions created by the specified user with the specified status</returns>
    [HttpGet("group/{groupId}/user/{userId}/status/{status}")]
    [SwaggerOperation(
        Summary = "Get contributions by user and status",
        Description = "Returns contributions created by a specific user in a group filtered by status",
        OperationId = "GetGroupContributionsByUserAndStatus",
        Tags = new[] { "Contributions" }
    )]
    [SwaggerResponse(200, "User's filtered contributions retrieved successfully")]
    [SwaggerResponse(404, "Group not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> GetGroupContributionsByUserAndStatus(
        [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "Group ID to retrieve contributions for")]
        Guid groupId,
        [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "User ID who contributed to the group")]
        Guid userId,
        [SwaggerExample("Pending", "Contribution status (Pending, Paid, or Cancelled)")]
        ContributionStatus status)
    {
        var response = await _contributionService.GetGroupContributionsByUserAndStatusAsync(groupId, userId, status);
        return HandleApiResponse(response);
    }
}
