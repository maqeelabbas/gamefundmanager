using GameFundManager.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GameFundManager.Infrastructure.Data.Configurations
{
    public class PollVoteConfiguration : IEntityTypeConfiguration<PollVote>
    {
        public void Configure(EntityTypeBuilder<PollVote> builder)
        {            builder.HasKey(pv => pv.Id);
            
            // Create a unique constraint for user-poll combination (a user can only vote once per poll)
            builder.HasIndex(pv => new { pv.UserId, pv.PollId })
                .IsUnique();
        }
    }
}
