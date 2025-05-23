using GameFundManager.Core.Entities;

namespace GameFundManager.Application.DTOs;

public class PollDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }
    public PollType PollType { get; set; }
    public string PollTypeName => PollType.ToString();
    public bool IsActive { get; set; }
    public bool IsExpired => DateTime.UtcNow > ExpiryDate;
    public Guid GroupId { get; set; }
    public Guid CreatedByUserId { get; set; }
    public UserDto CreatedByUser { get; set; } = null!;
    public List<PollOptionDto> Options { get; set; } = new List<PollOptionDto>();
    public int TotalVotes { get; set; }
}
