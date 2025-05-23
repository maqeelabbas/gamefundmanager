using GameFundManager.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GameFundManager.Infrastructure.Data.Configurations;

public class PollOptionConfiguration : IEntityTypeConfiguration<PollOption>
{
    public void Configure(EntityTypeBuilder<PollOption> builder)
    {
        builder.HasKey(po => po.Id);
        
        builder.Property(po => po.Text)
            .IsRequired()
            .HasMaxLength(255);
            
        // Relationships
        builder.HasMany(po => po.Votes)
            .WithOne(pv => pv.PollOption)
            .HasForeignKey(pv => pv.PollOptionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
