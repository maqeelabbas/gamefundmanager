using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GameFundManager.Infrastructure.Migrations;

/// <inheritdoc />
public partial class InitialCreate : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Users",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                FirstName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                LastName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                ProfilePictureUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                IsActive = table.Column<bool>(type: "bit", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Users", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "Groups",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                LogoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                TargetAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                IsActive = table.Column<bool>(type: "bit", nullable: false),
                Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false, defaultValue: "USD"),
                OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Groups", x => x.Id);
                table.ForeignKey(
                    name: "FK_Groups_Users_OwnerId",
                    column: x => x.OwnerId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "Contributions",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                Description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                ContributionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                PaymentMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                TransactionReference = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                GroupId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                ContributorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Contributions", x => x.Id);
                table.ForeignKey(
                    name: "FK_Contributions_Groups_GroupId",
                    column: x => x.GroupId,
                    principalTable: "Groups",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_Contributions_Users_ContributorUserId",
                    column: x => x.ContributorUserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Contributions_Users_CreatedByUserId",
                    column: x => x.CreatedByUserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "Expenses",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                ExpenseDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                ReceiptUrl = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                GroupId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                PaidByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Expenses", x => x.Id);
                table.ForeignKey(
                    name: "FK_Expenses_Groups_GroupId",
                    column: x => x.GroupId,
                    principalTable: "Groups",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_Expenses_Users_CreatedByUserId",
                    column: x => x.CreatedByUserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Expenses_Users_PaidByUserId",
                    column: x => x.PaidByUserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "GroupMembers",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                IsAdmin = table.Column<bool>(type: "bit", nullable: false),
                ContributionQuota = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                IsActive = table.Column<bool>(type: "bit", nullable: false),
                GroupId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_GroupMembers", x => x.Id);
                table.ForeignKey(
                    name: "FK_GroupMembers_Groups_GroupId",
                    column: x => x.GroupId,
                    principalTable: "Groups",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_GroupMembers_Users_UserId",
                    column: x => x.UserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "Polls",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                PollType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                IsActive = table.Column<bool>(type: "bit", nullable: false),
                GroupId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Polls", x => x.Id);
                table.ForeignKey(
                    name: "FK_Polls_Groups_GroupId",
                    column: x => x.GroupId,
                    principalTable: "Groups",
                    principalColumn: "Id");
                table.ForeignKey(
                    name: "FK_Polls_Users_CreatedByUserId",
                    column: x => x.CreatedByUserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "PollOptions",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Text = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                PollId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_PollOptions", x => x.Id);
                table.ForeignKey(
                    name: "FK_PollOptions_Polls_PollId",
                    column: x => x.PollId,
                    principalTable: "Polls",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateTable(
            name: "PollVotes",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                PollId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                PollOptionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_PollVotes", x => x.Id);
                table.ForeignKey(
                    name: "FK_PollVotes_PollOptions_PollOptionId",
                    column: x => x.PollOptionId,
                    principalTable: "PollOptions",
                    principalColumn: "Id");
                table.ForeignKey(
                    name: "FK_PollVotes_Polls_PollId",
                    column: x => x.PollId,
                    principalTable: "Polls",
                    principalColumn: "Id");
                table.ForeignKey(
                    name: "FK_PollVotes_Users_UserId",
                    column: x => x.UserId,
                    principalTable: "Users",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateIndex(
            name: "IX_Contributions_ContributorUserId",
            table: "Contributions",
            column: "ContributorUserId");

        migrationBuilder.CreateIndex(
            name: "IX_Contributions_CreatedByUserId",
            table: "Contributions",
            column: "CreatedByUserId");

        migrationBuilder.CreateIndex(
            name: "IX_Contributions_GroupId",
            table: "Contributions",
            column: "GroupId");

        migrationBuilder.CreateIndex(
            name: "IX_Expenses_CreatedByUserId",
            table: "Expenses",
            column: "CreatedByUserId");

        migrationBuilder.CreateIndex(
            name: "IX_Expenses_GroupId",
            table: "Expenses",
            column: "GroupId");

        migrationBuilder.CreateIndex(
            name: "IX_Expenses_PaidByUserId",
            table: "Expenses",
            column: "PaidByUserId");

        migrationBuilder.CreateIndex(
            name: "IX_GroupMembers_GroupId",
            table: "GroupMembers",
            column: "GroupId");

        migrationBuilder.CreateIndex(
            name: "IX_GroupMembers_UserId_GroupId",
            table: "GroupMembers",
            columns: new[] { "UserId", "GroupId" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_Groups_OwnerId",
            table: "Groups",
            column: "OwnerId");

        migrationBuilder.CreateIndex(
            name: "IX_PollOptions_PollId",
            table: "PollOptions",
            column: "PollId");

        migrationBuilder.CreateIndex(
            name: "IX_Polls_CreatedByUserId",
            table: "Polls",
            column: "CreatedByUserId");

        migrationBuilder.CreateIndex(
            name: "IX_Polls_GroupId",
            table: "Polls",
            column: "GroupId");

        migrationBuilder.CreateIndex(
            name: "IX_PollVotes_PollId",
            table: "PollVotes",
            column: "PollId");

        migrationBuilder.CreateIndex(
            name: "IX_PollVotes_PollOptionId",
            table: "PollVotes",
            column: "PollOptionId");

        migrationBuilder.CreateIndex(
            name: "IX_PollVotes_UserId_PollId",
            table: "PollVotes",
            columns: new[] { "UserId", "PollId" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_Users_Email",
            table: "Users",
            column: "Email",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_Users_Username",
            table: "Users",
            column: "Username",
            unique: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "Contributions");

        migrationBuilder.DropTable(
            name: "Expenses");

        migrationBuilder.DropTable(
            name: "GroupMembers");

        migrationBuilder.DropTable(
            name: "PollVotes");

        migrationBuilder.DropTable(
            name: "PollOptions");

        migrationBuilder.DropTable(
            name: "Polls");

        migrationBuilder.DropTable(
            name: "Groups");

        migrationBuilder.DropTable(
            name: "Users");
    }
}
