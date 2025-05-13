using GameFundManager.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GameFundManager.Infrastructure.Data.Configurations
{
    public class ContributionConfiguration : IEntityTypeConfiguration<Contribution>
    {
        public void Configure(EntityTypeBuilder<Contribution> builder)
        {
            builder.HasKey(c => c.Id);
            
            builder.Property(c => c.Amount)
                .IsRequired()
                .HasPrecision(18, 2);
                
            builder.Property(c => c.Description)
                .IsRequired()
                .HasMaxLength(255);
                
            builder.Property(c => c.ContributionDate)
                .IsRequired();
                
            builder.Property(c => c.PaymentMethod)
                .HasMaxLength(50);
                  builder.Property(c => c.TransactionReference)
                .HasMaxLength(100);
                  builder.Property(c => c.Status)
                .IsRequired()
                .HasConversion<string>();
            
            // Configure relationships
            builder.HasOne(c => c.Group)
                .WithMany()
                .HasForeignKey(c => c.GroupId)
                .OnDelete(DeleteBehavior.Cascade);
                  builder.HasOne(c => c.ContributorUser)
                .WithMany()
                .HasForeignKey(c => c.ContributorUserId)
                .OnDelete(DeleteBehavior.Restrict);
                
            builder.HasOne(c => c.CreatedByUser)
                .WithMany()
                .HasForeignKey(c => c.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
