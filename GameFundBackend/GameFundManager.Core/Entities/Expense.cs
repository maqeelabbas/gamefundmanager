using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace GameFundManager.Core.Entities;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ExpenseStatus
{
    [EnumMember(Value = "Proposed")]
    Proposed,
    
    [EnumMember(Value = "Approved")]
    Approved,
    
    [EnumMember(Value = "Rejected")]
    Rejected,
    
    [EnumMember(Value = "Completed")]
    Completed,
    
    [EnumMember(Value = "Cancelled")]
    Cancelled
}

public class Expense : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime ExpenseDate { get; set; }
    public ExpenseStatus Status { get; set; } = ExpenseStatus.Proposed;
    public string? ReceiptUrl { get; set; }        // Foreign keys
    public Guid GroupId { get; set; }
    public Guid CreatedByUserId { get; set; }
    public Guid PaidByUserId { get; set; }  // Add this field

    // Navigation properties
    public virtual Group Group { get; set; } = null!;
    public virtual User CreatedByUser { get; set; } = null!;
    public virtual User PaidByUser { get; set; } = null!;  // User who paid for the expense
}
