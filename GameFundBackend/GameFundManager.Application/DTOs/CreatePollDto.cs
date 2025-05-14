using GameFundManager.Core.Entities;

namespace GameFundManager.Application.DTOs;

public class CreatePollDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }
    public PollType PollType { get; set; } = PollType.SingleChoice;
    public Guid GroupId { get; set; }
    public List<string> Options { get; set; } = new List<string>();
}
