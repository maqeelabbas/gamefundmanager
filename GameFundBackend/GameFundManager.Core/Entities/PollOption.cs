namespace GameFundManager.Core.Entities;

public class PollOption : BaseEntity
{
    public string Text { get; set; } = string.Empty;
    
    // Foreign keys
    public Guid PollId { get; set; }
    
    // Navigation properties
    public virtual Poll Poll { get; set; } = null!;
    public virtual ICollection<PollVote> Votes { get; set; } = new List<PollVote>();
}
