using GameFundManager.Application.DTOs;
using GameFundManager.Application.Interfaces;
using GameFundManager.API.Swagger;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace GameFundManager.API.Controllers;

[Authorize]
public class PollsController : BaseApiController
{
    private readonly IPollService _pollService;

    public PollsController(IPollService pollService)
    {
        _pollService = pollService;
    }

    /// <summary>
    /// Get all polls for a specific group
    /// </summary>
    /// <param name="groupId">Group ID to retrieve polls for</param>
    /// <returns>List of polls for the specified group</returns>
    [HttpGet("group/{groupId}")]
    [SwaggerOperation(
        Summary = "Get group polls",
        Description = "Returns all polls for a specific group",
        OperationId = "GetGroupPolls",
        Tags = new[] { "Polls" }
    )]
    [SwaggerResponse(200, "Group polls retrieved successfully")]
    [SwaggerResponse(404, "Group not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> GetGroupPolls(
        [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "Group ID to retrieve polls for")]
        Guid groupId)
    {
        var response = await _pollService.GetGroupPollsAsync(groupId);
        return HandleApiResponse(response);
    }

    /// <summary>
    /// Get a specific poll by ID
    /// </summary>
    /// <param name="id">Poll ID to retrieve</param>
    /// <returns>Details of the specified poll with voting options and results</returns>
    [HttpGet("{id}")]
    [SwaggerOperation(
        Summary = "Get poll by ID",
        Description = "Returns detailed information about a specific poll including options and vote counts",
        OperationId = "GetPollById",
        Tags = new[] { "Polls" }
    )]
    [SwaggerResponse(200, "Poll retrieved successfully")]
    [SwaggerResponse(404, "Poll not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> GetPollById(
        [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "Poll ID to retrieve")]
        Guid id)
    {
        var response = await _pollService.GetPollByIdAsync(id);
        return HandleApiResponse(response);
    }

    /// <summary>
    /// Create a new poll for a group
    /// </summary>
    /// <param name="pollDto">Poll details with options</param>
    /// <returns>Created poll details</returns>
    [HttpPost]
    [SwaggerOperation(
        Summary = "Create new poll",
        Description = "Creates a new poll for a group with multiple options for members to vote on",
        OperationId = "CreatePoll",
        Tags = new[] { "Polls" }
    )]
    [SwaggerResponse(201, "Poll created successfully")]
    [SwaggerResponse(400, "Invalid poll information")]
    [SwaggerResponse(404, "Group not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> CreatePoll(
        [FromBody, SwaggerExample(
            "{\"groupId\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"question\":\"What equipment should we purchase next?\",\"description\":\"We need to decide on our next equipment purchase\",\"endDate\":\"2023-09-20T23:59:59\",\"options\":[{\"text\":\"New Crickets\"},{\"text\":\"Training jerseys\"},{\"text\":\"Water bottles\"}]}",
            "Poll details with voting options")]
        CreatePollDto pollDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        var response = await _pollService.CreatePollAsync(pollDto, userId);
        return HandleApiResponse(response);
    }

    /// <summary>
    /// Submit a vote on a poll
    /// </summary>
    /// <param name="voteDto">Vote details</param>
    /// <returns>Updated poll with voting results</returns>
    [HttpPost("vote")]
    [SwaggerOperation(
        Summary = "Submit poll vote",
        Description = "Submit a user's vote for a specific option in a poll. Each user can vote only once per poll.",
        OperationId = "SubmitVote",
        Tags = new[] { "Polls" }
    )]
    [SwaggerResponse(200, "Vote submitted successfully")]
    [SwaggerResponse(400, "Invalid vote information or user has already voted")]
    [SwaggerResponse(404, "Poll or option not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> SubmitVote(
        [FromBody, SwaggerExample(
            "{\"pollId\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"optionId\":\"4fa85f64-5717-4562-b3fc-2c963f66afa7\"}",
            "Vote details")]
        SubmitPollVoteDto voteDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        var response = await _pollService.SubmitVoteAsync(voteDto, userId);
        return HandleApiResponse(response);
    }

    /// <summary>
    /// Delete a poll
    /// </summary>
    /// <param name="id">Poll ID to delete</param>
    /// <returns>Success or failure message</returns>
    [HttpDelete("{id}")]
    [SwaggerOperation(
        Summary = "Delete poll",
        Description = "Deletes a poll and all associated votes. Only the poll creator or a group admin can delete polls.",
        OperationId = "DeletePoll",
        Tags = new[] { "Polls" }
    )]
    [SwaggerResponse(200, "Poll deleted successfully")]
    [SwaggerResponse(403, "Not authorized to delete this poll")]
    [SwaggerResponse(404, "Poll not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> DeletePoll(
        [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "Poll ID to delete")]
        Guid id)
    {
        var userId = GetCurrentUserId();
        var response = await _pollService.DeletePollAsync(id, userId);
        return HandleApiResponse(response);
    }
}
