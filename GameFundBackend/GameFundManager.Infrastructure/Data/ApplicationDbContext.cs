using GameFundManager.Core.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace GameFundManager.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        
        public DbSet<User> Users { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupMember> GroupMembers { get; set; }
        public DbSet<Contribution> Contributions { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Poll> Polls { get; set; }
        public DbSet<PollOption> PollOptions { get; set; }
        public DbSet<PollVote> PollVotes { get; set; }
          protected override void OnModelCreating(ModelBuilder modelBuilder)
        {            base.OnModelCreating(modelBuilder);
            
            // Apply configurations from the current assembly
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
            
            // Manually configure PollVote relationships to avoid multiple cascade paths
            modelBuilder.Entity<PollVote>()
                .HasOne(pv => pv.Poll)
                .WithMany(p => p.Votes)
                .HasForeignKey(pv => pv.PollId)
                .OnDelete(DeleteBehavior.NoAction);
                
            modelBuilder.Entity<PollVote>()
                .HasOne(pv => pv.User)
                .WithMany()
                .HasForeignKey(pv => pv.UserId)
                .OnDelete(DeleteBehavior.NoAction);
                
            modelBuilder.Entity<PollVote>()
                .HasOne(pv => pv.PollOption)
                .WithMany(po => po.Votes)
                .HasForeignKey(pv => pv.PollOptionId)
                .OnDelete(DeleteBehavior.NoAction);
                
            // Configure other relationships with cascade delete to avoid multiple paths
            modelBuilder.Entity<Poll>()
                .HasOne(p => p.Group)
                .WithMany()
                .HasForeignKey(p => p.GroupId)
                .OnDelete(DeleteBehavior.NoAction);
                
            modelBuilder.Entity<PollOption>()
                .HasOne(po => po.Poll)
                .WithMany(p => p.Options)
                .HasForeignKey(po => po.PollId)
                .OnDelete(DeleteBehavior.NoAction);
        }
        
        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            foreach (var entry in ChangeTracker.Entries<BaseEntity>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.CreatedAt = DateTime.UtcNow;
                        break;
                    case EntityState.Modified:
                        entry.Entity.UpdatedAt = DateTime.UtcNow;
                        break;
                }
            }
            
            return base.SaveChangesAsync(cancellationToken);
        }
    }
}
