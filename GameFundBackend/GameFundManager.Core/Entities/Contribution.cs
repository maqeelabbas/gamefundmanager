namespace GameFundManager.Core.Entities
{
    public class Contribution : BaseEntity
    {
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime ContributionDate { get; set; }
        public string? PaymentMethod { get; set; }
        public string? TransactionReference { get; set; }
        
        // Foreign keys
        public Guid GroupId { get; set; }
        public Guid UserId { get; set; }
        
        // Navigation properties
        public virtual Group Group { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}
