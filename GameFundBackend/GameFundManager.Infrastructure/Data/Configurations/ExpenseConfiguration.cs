using GameFundManager.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GameFundManager.Infrastructure.Data.Configurations
{
    public class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
    {
        public void Configure(EntityTypeBuilder<Expense> builder)
        {
            builder.HasKey(e => e.Id);
            
            builder.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(100);
                
            builder.Property(e => e.Description)
                .IsRequired()
                .HasMaxLength(500);
                
            builder.Property(e => e.Amount)
                .IsRequired()
                .HasPrecision(18, 2);
                
            builder.Property(e => e.ExpenseDate)
                .IsRequired();
                
            builder.Property(e => e.Status)
                .IsRequired()
                .HasConversion<string>();
                
            builder.Property(e => e.ReceiptUrl)
                .HasMaxLength(255);
        }
    }
}
