using GameFundManager.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GameFundManager.Infrastructure.Data.Configurations;

public class GroupConfiguration : IEntityTypeConfiguration<Group>
{
    public void Configure(EntityTypeBuilder<Group> builder)
    {
        builder.HasKey(g => g.Id);
        
        builder.Property(g => g.Name)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(g => g.Description)
            .IsRequired()
            .HasMaxLength(500);
        
        builder.Property(g => g.TargetAmount)
            .IsRequired()
            .HasPrecision(18, 2);
            
        builder.Property(g => g.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("EUR");
            
        // Relationships
        builder.HasMany(g => g.Members)
            .WithOne(gm => gm.Group)
            .HasForeignKey(gm => gm.GroupId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasMany(g => g.Contributions)
            .WithOne(c => c.Group)
            .HasForeignKey(c => c.GroupId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasMany(g => g.Expenses)
            .WithOne(e => e.Group)
            .HasForeignKey(e => e.GroupId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasMany(g => g.Polls)
            .WithOne(p => p.Group)
            .HasForeignKey(p => p.GroupId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
