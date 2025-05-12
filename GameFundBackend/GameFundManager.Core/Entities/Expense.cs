namespace GameFundManager.Core.Entities
{
    public enum ExpenseStatus
    {
        Proposed,
        Approved,
        Rejected,
        Completed,
        Cancelled
    }

    public class Expense : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime ExpenseDate { get; set; }
        public ExpenseStatus Status { get; set; } = ExpenseStatus.Proposed;
        public string? ReceiptUrl { get; set; }
        
        // Foreign keys
        public Guid GroupId { get; set; }
        public Guid CreatedByUserId { get; set; }
        
        // Navigation properties
        public virtual Group Group { get; set; } = null!;
        public virtual User CreatedByUser { get; set; } = null!;
    }
}
