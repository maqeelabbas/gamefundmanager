namespace GameFundManager.Application.DTOs;

public class PollOptionDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public Guid PollId { get; set; }
    public int VoteCount { get; set; }
    public double Percentage { get; set; }
}
