using GameFundManager.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GameFundManager.Infrastructure.Data.Configurations;

public class GroupMemberConfiguration : IEntityTypeConfiguration<GroupMember>
{
    public void Configure(EntityTypeBuilder<GroupMember> builder)
    {
        builder.HasKey(gm => gm.Id);
        
        builder.Property(gm => gm.ContributionQuota)
            .HasPrecision(18, 2)
            .HasDefaultValue(0);
        
        // Create a unique constraint for user-group combination
        builder.HasIndex(gm => new { gm.UserId, gm.GroupId })
            .IsUnique();
    }
}
