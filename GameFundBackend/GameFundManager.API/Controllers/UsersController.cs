using GameFundManager.API.Swagger;
using GameFundManager.Application.DTOs;
using GameFundManager.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace GameFundManager.API.Controllers;

/// <summary>
/// Controller for user management operations
/// </summary>
[Authorize]
public class UsersController : BaseApiController
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Get all users
    /// </summary>
    /// <returns>List of all users</returns>
    [HttpGet]
    [SwaggerOperation(
        Summary = "Get all users",
        Description = "Returns a list of all registered users",
        OperationId = "GetAllUsers",
        Tags = new[] { "Users" }
    )]
    [SwaggerResponse(200, "List of users retrieved successfully", typeof(List<UserDto>))]
    [SwaggerResponse(401, "Unauthorized access")]
    [SwaggerResponseExample(200, "{\"success\":true,\"message\":\"Users retrieved successfully\",\"data\":[{\"id\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"username\":\"johndoe\",\"email\":\"john@example.com\",\"firstName\":\"John\",\"lastName\":\"Doe\",\"phoneNumber\":\"1234567890\",\"profilePictureUrl\":null},{\"id\":\"4fa85f64-5717-4562-b3fc-2c963f66afa7\",\"username\":\"janedoe\",\"email\":\"jane@example.com\",\"firstName\":\"Jane\",\"lastName\":\"Doe\",\"phoneNumber\":\"0987654321\",\"profilePictureUrl\":null}],\"errors\":null}")]
    public async Task<IActionResult> GetAllUsers()
    {
        var response = await _userService.GetAllUsersAsync();
        return HandleApiResponse(response);
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>User information</returns>
    [HttpGet("{id}")]
    [SwaggerOperation(
        Summary = "Get user by ID",
        Description = "Returns a specific user by their ID",
        OperationId = "GetUserById",
        Tags = new[] { "Users" }
    )]
    [SwaggerResponse(200, "User retrieved successfully", typeof(UserDto))]
    [SwaggerResponse(404, "User not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    [SwaggerResponseExample(200, "{\"success\":true,\"message\":\"User retrieved successfully\",\"data\":{\"id\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"username\":\"johndoe\",\"email\":\"john@example.com\",\"firstName\":\"John\",\"lastName\":\"Doe\",\"phoneNumber\":\"1234567890\",\"profilePictureUrl\":null},\"errors\":null}")]
    public async Task<IActionResult> GetUserById(
        [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "User ID to retrieve")]
        Guid id)
    {
        var response = await _userService.GetUserByIdAsync(id);
        return HandleApiResponse(response);
    }

    /// <summary>
    /// Update user profile
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="userDto">Updated user information</param>
    /// <returns>Updated user information</returns>
    [HttpPut("{id}")]
    [SwaggerOperation(
        Summary = "Update user profile",
        Description = "Updates user profile information. Users can only update their own profiles.",
        OperationId = "UpdateUser",
        Tags = new[] { "Users" }
    )]
    [SwaggerResponse(200, "User updated successfully", typeof(UserDto))]
    [SwaggerResponse(400, "Invalid user information")]
    [SwaggerResponse(403, "Forbidden - Cannot update another user's profile")]
    [SwaggerResponse(404, "User not found")]
    [SwaggerResponse(401, "Unauthorized access")]
    [SwaggerResponseExample(200, "{\"success\":true,\"message\":\"User updated successfully\",\"data\":{\"id\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"username\":\"johndoe\",\"email\":\"john@example.com\",\"firstName\":\"John Updated\",\"lastName\":\"Doe Updated\",\"phoneNumber\":\"1234567890\",\"profilePictureUrl\":\"https://example.com/profile.jpg\"},\"errors\":null}")]
    public async Task<IActionResult> UpdateUser(
        [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "User ID to update")]
        Guid id,
        [FromBody, SwaggerExample(
            "{\"firstName\":\"John Updated\",\"lastName\":\"Doe Updated\",\"phoneNumber\":\"1234567890\",\"profilePictureUrl\":\"https://example.com/profile.jpg\"}",
            "Updated user information")]
        UserDto userDto)
    {
        if (id != GetCurrentUserId())
        {
            return Forbid("You can only update your own profile");
        }

        var response = await _userService.UpdateUserAsync(id, userDto); 
        return HandleApiResponse(response);
    }

    /// <summary>
    /// Search for users by name or email
    /// </summary>
    /// <param name="term">Search term (minimum 2 characters)</param>
    /// <param name="limit">Maximum number of results to return</param>
    /// <returns>List of matching users</returns>
    [HttpGet("search")]
    [SwaggerOperation(
        Summary = "Search for users by name or email",
        Description = "Returns a list of users matching the search term",
        OperationId = "SearchUsers",
        Tags = new[] { "Users" }
    )]
    [SwaggerResponse(200, "Users found successfully", typeof(List<UserSearchResponseDto>))]
    [SwaggerResponse(400, "Invalid search parameters")]
    [SwaggerResponse(401, "Unauthorized access")]
    public async Task<IActionResult> SearchUsers([FromQuery] string term, [FromQuery] int limit = 10)
    {
        var response = await _userService.SearchUsersAsync(term, limit);
        return HandleApiResponse(response);
    }
}
