namespace GameFundManager.Application.DTOs;

public class CreateGroupDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }    public decimal TargetAmount { get; set; }
    public DateTime? DueDate { get; set; } // Contains both the target date and the monthly due day
    public string Currency { get; set; } = "EUR";
}
