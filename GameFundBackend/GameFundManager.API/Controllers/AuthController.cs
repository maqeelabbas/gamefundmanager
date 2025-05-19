using GameFundManager.API.Swagger;
using GameFundManager.Application.DTOs;
using GameFundManager.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace GameFundManager.API.Controllers;

/// <summary>
/// Controller for authentication operations
/// </summary>
public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    /// <param name="registerDto">User registration information</param>
    /// <returns>User information with authentication token</returns>
    [HttpPost("register")]
    [SwaggerOperation(
        Summary = "Register a new user",
        Description = "Creates a new user account in the system",
        OperationId = "RegisterUser",
        Tags = new[] { "Authentication" }
    )]
    [SwaggerResponse(200, "User successfully registered", typeof(UserDto))]
    [SwaggerResponse(400, "Invalid registration information")]
    [SwaggerResponseExample(200, "{\"success\":true,\"message\":\"User registered successfully\",\"data\":{\"id\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"username\":\"johndoe\",\"email\":\"john@example.com\",\"firstName\":\"John\",\"lastName\":\"Doe\",\"phoneNumber\":\"1234567890\",\"profilePictureUrl\":null,\"token\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"},\"errors\":null}")]
    public async Task<IActionResult> Register(
        [FromBody, SwaggerExample(
            "{\"username\":\"johndoe\",\"email\":\"john@example.com\",\"password\":\"Password123!\",\"confirmPassword\":\"Password123!\",\"firstName\":\"John\",\"lastName\":\"Doe\",\"phoneNumber\":\"1234567890\"}",
            "User registration information")]
        RegisterUserDto registerDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var response = await _authService.RegisterAsync(registerDto);
        return HandleApiResponse(response);
    }

    /// <summary>
    /// Login with existing user credentials
    /// </summary>
    /// <param name="loginDto">User login credentials</param>
    /// <returns>User information with authentication token</returns>
    [HttpPost("login")]
    [SwaggerOperation(
        Summary = "Login an existing user",
        Description = "Authenticates user credentials and returns a JWT token",
        OperationId = "LoginUser",
        Tags = new[] { "Authentication" }
    )]
    [SwaggerResponse(200, "User successfully logged in", typeof(UserDto))]
    [SwaggerResponse(400, "Invalid login credentials")]
    [SwaggerResponseExample(200, "{\"success\":true,\"message\":\"Login successful\",\"data\":{\"id\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"username\":\"johndoe\",\"email\":\"john@example.com\",\"firstName\":\"John\",\"lastName\":\"Doe\",\"phoneNumber\":\"1234567890\",\"profilePictureUrl\":null,\"token\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"},\"errors\":null}")]
    public async Task<IActionResult> Login(
        [FromBody, SwaggerExample(
            "{\"email\":\"john@example.com\",\"password\":\"Password123!\"}",
            "User login credentials")]
        LoginUserDto loginDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var response = await _authService.LoginAsync(loginDto);
        return HandleApiResponse(response);
    }

    /// <summary>
    /// Get the current authenticated user's information
    /// </summary>
    /// <returns>Current user information</returns>
    [HttpGet("me")]
    [Authorize]
    [SwaggerOperation(
        Summary = "Get current user profile",
        Description = "Returns the profile of the currently authenticated user",
        OperationId = "GetCurrentUser",
        Tags = new[] { "Authentication" }
    )]
    [SwaggerResponse(200, "Current user information retrieved successfully", typeof(UserDto))]
    [SwaggerResponse(401, "Unauthorized access")]
    [SwaggerResponseExample(200, "{\"success\":true,\"message\":\"User information retrieved\",\"data\":{\"id\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"username\":\"johndoe\",\"email\":\"john@example.com\",\"firstName\":\"John\",\"lastName\":\"Doe\",\"phoneNumber\":\"1234567890\",\"profilePictureUrl\":null},\"errors\":null}")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = GetCurrentUserId();
        var response = await _authService.GetCurrentUserAsync(userId);
        return HandleApiResponse(response);
    }

    /// <summary>
    /// Refresh an authentication token
    /// </summary>
    /// <param name="refreshTokenDto">Token refresh request</param>
    /// <returns>New authentication token</returns>
    [HttpPost("refresh-token")]
    [AllowAnonymous]
    [SwaggerOperation(
        Summary = "Refresh an authentication token",
        Description = "Validates an existing token and issues a new one if valid",
        OperationId = "RefreshToken",
        Tags = new[] { "Authentication" }
    )]
    [SwaggerResponse(200, "Token refreshed successfully", typeof(RefreshTokenResponseDto))]
    [SwaggerResponse(400, "Invalid token")]
    [SwaggerResponseExample(200, "{\"success\":true,\"message\":\"Token refreshed successfully\",\"data\":{\"token\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\",\"tokenExpires\":\"2023-05-16T10:30:00Z\",\"userId\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\"},\"errors\":null}")]
    public async Task<IActionResult> RefreshToken(
        [FromBody, SwaggerExample(
            "{\"token\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"}",
            "Token refresh request")]
        RefreshTokenDto refreshTokenDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var response = await _authService.RefreshTokenAsync(refreshTokenDto.Token);
        return HandleApiResponse(response);
    }

    /// <summary>
    /// Validate token without refreshing
    /// </summary>
    /// <returns>Validation result</returns>
    [HttpGet("validate-token")]
    [Authorize]
    [SwaggerOperation(
        Summary = "Validate an authentication token",
        Description = "Validates the current token without refreshing it",
        OperationId = "ValidateToken",
        Tags = new[] { "Authentication" }
    )]
    [SwaggerResponse(200, "Token is valid")]
    [SwaggerResponse(401, "Token is invalid or expired")]
    public IActionResult ValidateToken()
    {
        // If we get here, the token is valid (because of the [Authorize] attribute)
        return Ok(new
        {
            success = true,
            message = "Token is valid",
            data = new { isValid = true, userId = GetCurrentUserId() },
            errors = (string[])null
        });
    }    /// <summary>
    /// Health check endpoint to test API connectivity
    /// </summary>
    /// <returns>API status information</returns>
    [HttpGet("healthcheck")]
    [AllowAnonymous]
    [SwaggerOperation(
        Summary = "API Health Check",
        Description = "Simple endpoint to verify connectivity to the API",
        OperationId = "ApiHealthCheck",
        Tags = new[] { "Diagnostics" }
    )]
    [SwaggerResponse(200, "API is operational")]
    public IActionResult HealthCheck()
    {
        // Return a simple success response with connection information
        var connectionInfo = new
        {
            Status = "OK",
            Timestamp = DateTime.UtcNow,
            Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
            Server = Environment.MachineName,
            ApiVersion = "1.0"
        };

        return Ok(new
        {
            success = true,
            message = "API is operational",
            data = connectionInfo,
            errors = (string[]?)null
        });
    }
}
