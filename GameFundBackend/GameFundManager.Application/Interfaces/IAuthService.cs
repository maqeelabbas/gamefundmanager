using GameFundManager.Application.Common;
using GameFundManager.Application.DTOs;
using GameFundManager.Core.Entities;

namespace GameFundManager.Application.Interfaces
{
    public interface IAuthService
    {
        Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginUserDto loginDto);
        Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterUserDto registerDto);
        Task<ApiResponse<UserDto>> GetCurrentUserAsync(Guid userId);
        Task<string> GenerateJwtTokenAsync(User user);
        Task<ApiResponse<RefreshTokenResponseDto>> RefreshTokenAsync(string token);
        Guid? ValidateTokenWithoutLifetimeChecks(string token);
    }
}
