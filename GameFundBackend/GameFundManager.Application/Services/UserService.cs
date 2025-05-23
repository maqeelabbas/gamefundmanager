using AutoMapper;
using GameFundManager.Application.Common;
using GameFundManager.Application.DTOs;
using GameFundManager.Application.Interfaces;
using GameFundManager.Core.Interfaces;

namespace GameFundManager.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public UserService(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<ApiResponse<IEnumerable<UserDto>>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllAsync();
        var userDtos = _mapper.Map<IEnumerable<UserDto>>(users);
        
        return ApiResponse<IEnumerable<UserDto>>.SuccessResponse(userDtos);
    }

    public async Task<ApiResponse<UserDto>> GetUserByIdAsync(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        
        if (user == null)
            return ApiResponse<UserDto>.FailureResponse("User not found");
            
        var userDto = _mapper.Map<UserDto>(user);
        return ApiResponse<UserDto>.SuccessResponse(userDto);
    }

    public async Task<ApiResponse<UserDto>> UpdateUserAsync(Guid id, UserDto userDto)
    {
        var user = await _userRepository.GetByIdAsync(id);
        
        if (user == null)
            return ApiResponse<UserDto>.FailureResponse("User not found");
        
        // Update user properties (but not password)
        user.FirstName = userDto.FirstName;
        user.LastName = userDto.LastName;
        user.PhoneNumber = userDto.PhoneNumber;
        user.ProfilePictureUrl = userDto.ProfilePictureUrl;
        
        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();
        
        var updatedUserDto = _mapper.Map<UserDto>(user);
        return ApiResponse<UserDto>.SuccessResponse(updatedUserDto, "User updated successfully");
    }

    public async Task<ApiResponse<IEnumerable<UserSearchResponseDto>>> SearchUsersAsync(string searchTerm, int maxResults = 10)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(searchTerm) || searchTerm.Length < 2)
            {
                return ApiResponse<IEnumerable<UserSearchResponseDto>>.FailureResponse("Search term must be at least 2 characters");
            }
            
            var users = await _userRepository.SearchUsersAsync(searchTerm, maxResults);
            
            var result = users.Select(u => new UserSearchResponseDto
            {
                Id = u.Id.ToString(),
                Name = $"{u.FirstName} {u.LastName}",
                Email = u.Email,
                PhoneNumber = u.PhoneNumber,
                ProfilePictureUrl = u.ProfilePictureUrl
            }).ToList();
            
            return ApiResponse<IEnumerable<UserSearchResponseDto>>.SuccessResponse(result, $"Found {result.Count} users");
        }
        catch (Exception ex)
        {
            return ApiResponse<IEnumerable<UserSearchResponseDto>>.FailureResponse($"Error searching users: {ex.Message}");
        }
    }
}
