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
        public string StatusName { get; set; } = string.Empty;
        public string? ReceiptUrl { get; set; }
        public Guid GroupId { get; set; }
        public Guid CreatedByUserId { get; set; }
        public required UserDto CreatedByUser { get; set; } // Added required modifier
        public Guid PaidByUserId { get; set; }  // Add this field
        public required UserDto PaidByUser { get; set; }  // Added required modifier
    }
}
