namespace GameFundManager.Core.Entities
{
    public enum PollType
    {
        SingleChoice,
        MultipleChoice
    }

    public class Poll : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime ExpiryDate { get; set; }
        public PollType PollType { get; set; } = PollType.SingleChoice;
        public bool IsActive { get; set; } = true;
        
        // Foreign keys
        public Guid GroupId { get; set; }
        public Guid CreatedByUserId { get; set; }
        
        // Navigation properties
        public virtual Group Group { get; set; } = null!;
        public virtual User CreatedByUser { get; set; } = null!;
        public virtual ICollection<PollOption> Options { get; set; } = new List<PollOption>();
        public virtual ICollection<PollVote> Votes { get; set; } = new List<PollVote>();
    }
}
