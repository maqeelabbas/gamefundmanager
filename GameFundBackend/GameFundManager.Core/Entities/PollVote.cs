namespace GameFundManager.Core.Entities
{
    public class PollVote : BaseEntity
    {
        // Foreign keys
        public Guid PollId { get; set; }
        public Guid PollOptionId { get; set; }
        public Guid UserId { get; set; }
        
        // Navigation properties
        public virtual Poll Poll { get; set; } = null!;
        public virtual PollOption PollOption { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}
