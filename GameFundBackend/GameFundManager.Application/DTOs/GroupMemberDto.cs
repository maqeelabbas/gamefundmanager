namespace GameFundManager.Application.DTOs
{
    public class GroupMemberDto
    {
        public Guid Id { get; set; }
        public Guid GroupId { get; set; }
        public Guid UserId { get; set; }
        public UserDto User { get; set; } = null!;
        public bool IsAdmin { get; set; }
        public decimal ContributionQuota { get; set; }
        public bool IsActive { get; set; }
    }
}
