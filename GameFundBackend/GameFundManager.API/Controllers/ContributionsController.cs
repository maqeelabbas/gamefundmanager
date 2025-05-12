using GameFundManager.Application.DTOs;
using GameFundManager.Application.Interfaces;
using GameFundManager.API.Swagger;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using Swashbuckle.AspNetCore.Annotations;

namespace GameFundManager.API.Controllers
{
    [Authorize]
    public class ContributionsController : BaseApiController
    {
        private readonly IContributionService _contributionService;

        public ContributionsController(IContributionService contributionService)
        {
            _contributionService = contributionService;
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
        }

        /// <summary>
        /// Add a new contribution to a group
        /// </summary>
        /// <param name="contributionDto">Contribution details</param>
        /// <returns>Created contribution details</returns>
        [HttpPost]
        [SwaggerOperation(
            Summary = "Add a contribution",
            Description = "Creates a new contribution to a group by the current user",
            OperationId = "AddContribution",
            Tags = new[] { "Contributions" }
        )]
        [SwaggerResponse(201, "Contribution added successfully")]
        [SwaggerResponse(400, "Invalid contribution information")]
        [SwaggerResponse(404, "Group not found")]
        [SwaggerResponse(401, "Unauthorized access")]
        public async Task<IActionResult> AddContribution(
            [FromBody, SwaggerExample(
                "{\"groupId\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"amount\":50.00,\"notes\":\"Monthly contribution\",\"paymentMethod\":\"CreditCard\"}", 
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
        }

        /// <summary>
        /// Delete a contribution
        /// </summary>
        /// <param name="id">Contribution ID to delete</param>
        /// <returns>Success or failure message</returns>
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
    }
}
