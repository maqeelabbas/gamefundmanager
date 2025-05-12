namespace GameFundManager.Core.Entities
{
    public class Group : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public decimal TargetAmount { get; set; }
        public DateTime? DueDate { get; set; }
        public bool IsActive { get; set; } = true;
        public string Currency { get; set; } = "USD";
        
        // Foreign keys
        public Guid OwnerId { get; set; }
        
        // Navigation properties
        public virtual User Owner { get; set; } = null!;
        public virtual ICollection<GroupMember> Members { get; set; } = new List<GroupMember>();
        public virtual ICollection<Contribution> Contributions { get; set; } = new List<Contribution>();
        public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();
        public virtual ICollection<Poll> Polls { get; set; } = new List<Poll>();
    }
}
