using GameFundManager.Application.Common;
using GameFundManager.Application.DTOs;

namespace GameFundManager.Application.Interfaces;

public interface IUserService
{
    Task<ApiResponse<IEnumerable<UserDto>>> GetAllUsersAsync();
    Task<ApiResponse<UserDto>> GetUserByIdAsync(Guid id);
    Task<ApiResponse<UserDto>> UpdateUserAsync(Guid id, UserDto userDto);
}
