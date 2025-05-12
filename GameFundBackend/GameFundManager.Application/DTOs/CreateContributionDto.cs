namespace GameFundManager.Application.DTOs
{
    public class CreateContributionDto
    {
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime ContributionDate { get; set; }
        public string? PaymentMethod { get; set; }
        public string? TransactionReference { get; set; }
        public Guid GroupId { get; set; }
    }
}
