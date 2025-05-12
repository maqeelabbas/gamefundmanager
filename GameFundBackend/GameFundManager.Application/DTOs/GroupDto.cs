namespace GameFundManager.Application.DTOs
{
    public class GroupDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public decimal TargetAmount { get; set; }
        public DateTime? DueDate { get; set; }
        public bool IsActive { get; set; }
        public string Currency { get; set; } = string.Empty;
        public Guid OwnerId { get; set; }
        public UserDto Owner { get; set; } = null!;
        public int MemberCount { get; set; }
        public decimal TotalContributions { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal Balance => TotalContributions - TotalExpenses;
        public decimal ProgressPercentage => TargetAmount > 0 ? (TotalContributions / TargetAmount) * 100 : 0;
    }
}
