namespace GameFundManager.Application.DTOs;

public class AddGroupMemberDto
{
    public Guid GroupId { get; set; }
    public Guid UserId { get; set; }
    public bool IsAdmin { get; set; }
    public decimal ContributionQuota { get; set; }
}
