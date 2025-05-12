using AutoMapper;
using GameFundManager.Application.Common;
using GameFundManager.Application.DTOs;
using GameFundManager.Application.Interfaces;
using GameFundManager.Core.Entities;
using GameFundManager.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BC = BCrypt.Net.BCrypt;

namespace GameFundManager.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;

        public AuthService(IUserRepository userRepository, IMapper mapper, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _configuration = configuration;
        }

        public async Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginUserDto loginDto)
        {
            var user = await _userRepository.GetByEmailAsync(loginDto.Email);
            
            if (user == null)
                return ApiResponse<AuthResponseDto>.FailureResponse("Invalid email or password");
                
            if (!VerifyPasswordHash(loginDto.Password, user.PasswordHash))
                return ApiResponse<AuthResponseDto>.FailureResponse("Invalid email or password");
                
            var token = await GenerateJwtTokenAsync(user);
            
            var response = new AuthResponseDto
            {
                UserId = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Token = token,
                TokenExpires = DateTime.UtcNow.AddDays(7)
            };
            
            return ApiResponse<AuthResponseDto>.SuccessResponse(response, "Login successful");
        }

        public async Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterUserDto registerDto)
        {
            // Check if email already exists
            if (await _userRepository.GetByEmailAsync(registerDto.Email) != null)
                return ApiResponse<AuthResponseDto>.FailureResponse("Email is already registered");
                
            // Check if username already exists
            if (await _userRepository.GetByUsernameAsync(registerDto.Username) != null)
                return ApiResponse<AuthResponseDto>.FailureResponse("Username is already taken");
                
            // Check if passwords match
            if (registerDto.Password != registerDto.ConfirmPassword)
                return ApiResponse<AuthResponseDto>.FailureResponse("Passwords do not match");
                
            // Create user entity
            var user = _mapper.Map<User>(registerDto);
            user.PasswordHash = CreatePasswordHash(registerDto.Password);
            
            // Save user
            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();
            
            // Generate JWT token
            var token = await GenerateJwtTokenAsync(user);
            
            var response = new AuthResponseDto
            {
                UserId = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Token = token,
                TokenExpires = DateTime.UtcNow.AddDays(7)
            };
            
            return ApiResponse<AuthResponseDto>.SuccessResponse(response, "Registration successful");
        }

        public async Task<ApiResponse<UserDto>> GetCurrentUserAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            
            if (user == null)
                return ApiResponse<UserDto>.FailureResponse("User not found");
                
            var userDto = _mapper.Map<UserDto>(user);
            return ApiResponse<UserDto>.SuccessResponse(userDto);
        }

        public async Task<string> GenerateJwtTokenAsync(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];
            
            if (string.IsNullOrEmpty(secretKey))
                throw new InvalidOperationException("JWT secret key is not configured properly");
                
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Name, user.Username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };
            
            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );
              return new JwtSecurityTokenHandler().WriteToken(token);
        }
        
        #region Helper Methods        
        private string CreatePasswordHash(string password)
        {
            return BC.HashPassword(password);
        }

        private bool VerifyPasswordHash(string password, string hashedPassword)
        {
            return BC.Verify(password, hashedPassword);
        }
        #endregion
        
        public Guid? ValidateTokenWithoutLifetimeChecks(string token)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            
            if (string.IsNullOrEmpty(secretKey))
                return null;
            
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(secretKey);
                
                // Set validation parameters but ignore token expiration
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidAudience = jwtSettings["Audience"],
                    ValidateLifetime = false // Ignore token expiration
                };
                
                // Validate the token
                var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
                var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier) ?? principal.FindFirst(JwtRegisteredClaimNames.Sub);
                
                if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out Guid userId))
                {
                    return userId;
                }
            }
            catch
            {
                // Token validation failed
                return null;
            }
            
            return null;
        }
          public async Task<ApiResponse<RefreshTokenResponseDto>> RefreshTokenAsync(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return ApiResponse<RefreshTokenResponseDto>.FailureResponse("Invalid token provided");
            }
            
            // Validate the token without checking lifetime
            var userId = ValidateTokenWithoutLifetimeChecks(token);
            
            if (!userId.HasValue)
            {
                return ApiResponse<RefreshTokenResponseDto>.FailureResponse("Invalid or corrupted token");
            }
            
            // Find the user
            var user = await _userRepository.GetByIdAsync(userId.Value);
            
            if (user == null)
            {
                return ApiResponse<RefreshTokenResponseDto>.FailureResponse("User not found");
            }
            
            // Generate a new token
            var newToken = await GenerateJwtTokenAsync(user);
            
            // Get token expiration date
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(newToken);
            var tokenExpires = jwtToken.ValidTo;
            
            var response = new RefreshTokenResponseDto
            {
                Token = newToken,
                TokenExpires = tokenExpires,
                UserId = user.Id
            };
            
            return ApiResponse<RefreshTokenResponseDto>.SuccessResponse(response, "Token refreshed successfully");
        }
    }
}
