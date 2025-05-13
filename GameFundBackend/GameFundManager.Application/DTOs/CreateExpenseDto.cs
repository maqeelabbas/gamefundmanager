namespace GameFundManager.Application.DTOs
{
    public class CreateExpenseDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime ExpenseDate { get; set; }
        public string? ReceiptUrl { get; set; }
        public Guid GroupId { get; set; }
        public Guid PaidByUserId { get; set; }  // Add this field
    }
}
