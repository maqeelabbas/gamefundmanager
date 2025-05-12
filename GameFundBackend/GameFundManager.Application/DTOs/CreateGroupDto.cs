namespace GameFundManager.Application.DTOs
{
    public class CreateGroupDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public decimal TargetAmount { get; set; }
        public DateTime? DueDate { get; set; }
        public string Currency { get; set; } = "USD";
    }
}
