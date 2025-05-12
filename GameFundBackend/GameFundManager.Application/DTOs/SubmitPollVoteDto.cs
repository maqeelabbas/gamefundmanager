namespace GameFundManager.Application.DTOs
{
    public class SubmitPollVoteDto
    {
        public Guid PollId { get; set; }
        public Guid OptionId { get; set; }
    }
}
