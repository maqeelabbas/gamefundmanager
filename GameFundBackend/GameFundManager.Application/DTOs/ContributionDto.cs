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
        public Guid GroupId { get; set; }
        public Guid UserId { get; set; }
        public UserDto User { get; set; } = null!;
    }
}
