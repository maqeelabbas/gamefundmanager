using GameFundManager.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GameFundManager.Infrastructure.Data.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(u => u.Id);
            
            builder.Property(u => u.Username)
                .IsRequired()
                .HasMaxLength(50);
                
            builder.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(100);
                
            builder.Property(u => u.PasswordHash)
                .IsRequired();
                
            builder.Property(u => u.FirstName)
                .IsRequired()
                .HasMaxLength(50);
                
            builder.Property(u => u.LastName)
                .IsRequired()
                .HasMaxLength(50);
                
            builder.Property(u => u.PhoneNumber)
                .HasMaxLength(20);
                
            builder.HasIndex(u => u.Email)
                .IsUnique();
                
            builder.HasIndex(u => u.Username)
                .IsUnique();
                
            // Relationships
            builder.HasMany(u => u.OwnedGroups)
                .WithOne(g => g.Owner)
                .HasForeignKey(g => g.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);
                  builder.HasMany(u => u.Memberships)
                .WithOne(gm => gm.User)
                .HasForeignKey(gm => gm.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            builder.HasMany(u => u.Contributions)
                .WithOne(c => c.ContributorUser)
                .HasForeignKey(c => c.ContributorUserId)
                .OnDelete(DeleteBehavior.Restrict);
                
            builder.HasMany(u => u.Expenses)
                .WithOne(e => e.CreatedByUser)
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
                
            builder.HasMany(u => u.PollVotes)
                .WithOne(pv => pv.User)
                .HasForeignKey(pv => pv.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
