using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GameFundManager.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MemberConfigurations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ContributionPauseEndDate",
                table: "GroupMembers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ContributionPauseStartDate",
                table: "GroupMembers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ContributionStartDate",
                table: "GroupMembers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsContributionPaused",
                table: "GroupMembers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "JoinedDate",
                table: "GroupMembers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContributionPauseEndDate",
                table: "GroupMembers");

            migrationBuilder.DropColumn(
                name: "ContributionPauseStartDate",
                table: "GroupMembers");

            migrationBuilder.DropColumn(
                name: "ContributionStartDate",
                table: "GroupMembers");

            migrationBuilder.DropColumn(
                name: "IsContributionPaused",
                table: "GroupMembers");

            migrationBuilder.DropColumn(
                name: "JoinedDate",
                table: "GroupMembers");
        }
    }
}
