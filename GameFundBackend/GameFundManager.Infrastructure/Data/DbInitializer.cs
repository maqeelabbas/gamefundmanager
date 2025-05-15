using GameFundManager.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using BC = BCrypt.Net.BCrypt;

namespace GameFundManager.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task InitializeDatabaseAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        try
        {
            logger.LogInformation("Applying migrations");
            await context.Database.MigrateAsync();

            await SeedDataAsync(context, logger);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during database migration");
            throw;
        }
    }

    private static async Task SeedDataAsync(ApplicationDbContext context, ILogger logger)
    {
        // Seed admin user if no users exist
        if (!await context.Users.AnyAsync())
        {
            logger.LogInformation("Seeding admin user");

            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                Username = "admin",
                Email = "admin@gamefund.com",
                FirstName = "Aqeel",
                LastName = "Baloch",
                PasswordHash = CreatePasswordHash("123"),
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            await context.Users.AddAsync(adminUser);

            var regularUser1 = new User
            {
                Id = Guid.NewGuid(),
                Username = "javed",
                Email = "javed@gamefund.com",
                FirstName = "Javed",
                LastName = "Iqbal",
                PasswordHash = CreatePasswordHash("123"),
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var regularUser2 = new User
            {
                Id = Guid.NewGuid(),
                Username = "furqan",
                Email = "furgan@gamefund.com",
                FirstName = "Furqan",
                LastName = "Yousaf",
                PasswordHash = CreatePasswordHash("123"),
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            await context.Users.AddRangeAsync(regularUser1, regularUser2);

            // Create sample group
            var group = new Group
            {
                Id = Guid.NewGuid(),
                Name = "Cricket Team",
                Description = "Our local Cricket team fund for equipment and tournaments",
                TargetAmount = 1000,
                DueDate = DateTime.UtcNow.AddMonths(3),
                Currency = "EUR",
                OwnerId = adminUser.Id,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            await context.Groups.AddAsync(group);

            // Add members to group
            var members = new List<GroupMember>
            {
                new GroupMember
                {
                    Id = Guid.NewGuid(),
                    GroupId = group.Id,
                    UserId = adminUser.Id,
                    IsAdmin = true,
                    ContributionQuota = 100,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                },
                new GroupMember
                {
                    Id = Guid.NewGuid(),
                    GroupId = group.Id,
                    UserId = regularUser1.Id,
                    IsAdmin = false,
                    ContributionQuota = 100,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                },
                new GroupMember
                {
                    Id = Guid.NewGuid(),
                    GroupId = group.Id,
                    UserId = regularUser2.Id,
                    IsAdmin = false,
                    ContributionQuota = 100,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                }
            };

            await context.GroupMembers.AddRangeAsync(members);

            // Add some contributions
            var contributions = new List<Contribution>
            {
                new Contribution
                {
                    Id = Guid.NewGuid(),
                    Amount = 100,
                    Description = "Initial contribution",
                    ContributionDate = DateTime.UtcNow.AddDays(-10),
                    PaymentMethod = "Cash",
                    GroupId = group.Id,
                    Status = ContributionStatus.Paid,
                    ContributorUserId = adminUser.Id,
                    CreatedByUserId = adminUser.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new Contribution
                {
                    Id = Guid.NewGuid(),
                    Amount = 80,
                    Description = "First payment",
                    ContributionDate = DateTime.UtcNow.AddDays(-7),
                    PaymentMethod = "Bank Transfer",
                    GroupId = group.Id,
                    Status = ContributionStatus.Paid,
                    ContributorUserId = regularUser1.Id,
                    CreatedByUserId = adminUser.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-7)
                }
            };

            await context.Contributions.AddRangeAsync(contributions);

            // Add an expense
            await context.Expenses.AddAsync(new Expense
            {
                Id = Guid.NewGuid(),
                Title = "New Cricket Balls",
                Description = "Purchase of 2 new Cricket Bats for the team",
                Amount = 150,
                ExpenseDate = DateTime.UtcNow.AddDays(-5),
                Status = ExpenseStatus.Approved,
                GroupId = group.Id,
                CreatedByUserId = adminUser.Id,
                PaidByUserId = regularUser1.Id,
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            });

            await context.Expenses.AddAsync(new Expense
            {
                Id = Guid.NewGuid(),
                Title = "New Cricket Balls",
                Description = "Purchase of 10 new Cricket Balls for the team",
                Amount = 30,
                ExpenseDate = DateTime.UtcNow.AddDays(-5),
                Status = ExpenseStatus.Approved,
                GroupId = group.Id,
                CreatedByUserId = adminUser.Id,
                PaidByUserId = regularUser2.Id,
                CreatedAt = DateTime.UtcNow.AddDays(-4)
            });

            await context.SaveChangesAsync();
            logger.LogInformation("Database seeded successfully");
        }
        else
        {
            logger.LogInformation("Database already contains data - skipping seed");
        }
    }

    private static string CreatePasswordHash(string password)
    {
        return BC.HashPassword(password);
    }
}
