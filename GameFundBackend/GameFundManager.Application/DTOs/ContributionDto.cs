using GameFundManager.Core.Entities;

namespace GameFundManager.Application.DTOs
{
    public class ContributionDto
    {
        public Guid Id { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime ContributionDate { get; set; }
        public string? PaymentMethod { get; set; }
        public string? TransactionReference { get; set; }
        public ContributionStatus Status { get; set; }
        public string StatusName { get; set; } = string.Empty;        public Guid GroupId { get; set; }
        public Guid ContributorUserId { get; set; }   // ID of user who is making the contribution payment
        public Guid CreatedByUserId { get; set; }     // ID of user who created the contribution record
        public UserDto ContributorUser { get; set; } = null!;    // Contributing user
        public UserDto CreatedByUser { get; set; } = null!;    // User who created the contribution
    }
}
