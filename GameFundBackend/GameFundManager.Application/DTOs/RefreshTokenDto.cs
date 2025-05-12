using System;

namespace GameFundManager.Application.DTOs
{
    public class RefreshTokenDto
    {
        public string Token { get; set; } = string.Empty;
    }
    
    public class RefreshTokenResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public DateTime TokenExpires { get; set; }
        public Guid UserId { get; set; }
    }
}
