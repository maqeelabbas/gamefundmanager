using System;

namespace GameFundManager.Core.Entities;

public class GroupMember : BaseEntity
{
    public bool IsAdmin { get; set; } = false;
    public decimal ContributionQuota { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    
    // Contribution management properties
    public DateTime JoinedDate { get; set; } = DateTime.UtcNow;
    public DateTime? ContributionStartDate { get; set; } = DateTime.UtcNow;
    public bool IsContributionPaused { get; set; } = false;
    public DateTime? ContributionPauseStartDate { get; set; }
    public DateTime? ContributionPauseEndDate { get; set; }
    
    // Foreign keys
    public Guid GroupId { get; set; }
    public Guid UserId { get; set; }
    
    // Navigation properties
    public virtual Group Group { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
