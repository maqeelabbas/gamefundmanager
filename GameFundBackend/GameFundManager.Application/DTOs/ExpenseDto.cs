using GameFundManager.Core.Entities;

namespace GameFundManager.Application.DTOs
{
    public class ExpenseDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime ExpenseDate { get; set; }
        public ExpenseStatus Status { get; set; }
        public string StatusName => Status.ToString();
        public string? ReceiptUrl { get; set; }
        public Guid GroupId { get; set; }
        public Guid CreatedByUserId { get; set; }
        public UserDto CreatedByUser { get; set; } = null!;
    }
}
