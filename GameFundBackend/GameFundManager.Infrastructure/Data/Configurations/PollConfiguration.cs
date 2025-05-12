using GameFundManager.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GameFundManager.Infrastructure.Data.Configurations
{
    public class PollConfiguration : IEntityTypeConfiguration<Poll>
    {
        public void Configure(EntityTypeBuilder<Poll> builder)
        {
            builder.HasKey(p => p.Id);
            
            builder.Property(p => p.Title)
                .IsRequired()
                .HasMaxLength(100);
                
            builder.Property(p => p.Description)
                .IsRequired()
                .HasMaxLength(500);
                
            builder.Property(p => p.ExpiryDate)
                .IsRequired();
                
            builder.Property(p => p.PollType)
                .IsRequired()
                .HasConversion<string>();
                
            // Relationships
            builder.HasMany(p => p.Options)
                .WithOne(po => po.Poll)
                .HasForeignKey(po => po.PollId)
                .OnDelete(DeleteBehavior.Cascade);
                
            builder.HasMany(p => p.Votes)
                .WithOne(pv => pv.Poll)
                .HasForeignKey(pv => pv.PollId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
