using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace GameFundManager.Core.Entities;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ContributionStatus
{
    [EnumMember(Value = "Pending")]
    Pending,
    
    [EnumMember(Value = "Paid")]
    Paid,
    
    [EnumMember(Value = "Rejected")]
    Rejected,
    
    [EnumMember(Value = "Refunded")]
    Refunded,
    
    [EnumMember(Value = "Cancelled")]
    Cancelled
}

public class Contribution : BaseEntity
{
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime ContributionDate { get; set; }
    public string? PaymentMethod { get; set; }
    public string? TransactionReference { get; set; }
    public ContributionStatus Status { get; set; } = ContributionStatus.Pending;        // Foreign keys
    public Guid GroupId { get; set; }
    public Guid ContributorUserId { get; set; }  // User who is making the payment (contributor)
    public Guid CreatedByUserId { get; set; }    // User who created/recorded the contribution (could be admin or self)
    
    // Navigation properties
    public virtual Group Group { get; set; } = null!;
    public virtual User ContributorUser { get; set; } = null!; // Contributing user
    public virtual User CreatedByUser { get; set; } = null!;   // User who recorded the contribution
}
