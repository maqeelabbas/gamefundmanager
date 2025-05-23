namespace GameFundManager.Application.DTOs;

public class GroupDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }    public decimal TargetAmount { get; set; }
    public DateTime? DueDate { get; set; } // Contains both the target date and the monthly due day
    public bool IsActive { get; set; }
    public string Currency { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public UserDto Owner { get; set; } = null!;
    public int MemberCount { get; set; }
    public decimal TotalContributions { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal Balance => TotalContributions - TotalExpenses;
    public decimal ProgressPercentage => TargetAmount > 0 ? (TotalContributions / TargetAmount) * 100 : 0;
    
    // Contribution due date information
    public int? ContributionDueDay { get; set; } // Day of month when contributions are due (1-31)
    public DateTime? NextContributionDueDate { get; set; } // Next calculated contribution due date
    public string ContributionDueDayFormatted { get; set; } = string.Empty; // Formatted day (e.g., "15th")
}
