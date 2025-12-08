using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Turkisheco.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddForumUsersAndComments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "GuestName",
                table: "Comments",
                newName: "AuthorName");

            migrationBuilder.RenameColumn(
                name: "GuestEmail",
                table: "Comments",
                newName: "AuthorEmail");

            migrationBuilder.AddColumn<string>(
                name: "DisplayName",
                table: "ForumUsers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "ForumUsers",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DisplayName",
                table: "ForumUsers");

            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "ForumUsers");

            migrationBuilder.RenameColumn(
                name: "AuthorName",
                table: "Comments",
                newName: "GuestName");

            migrationBuilder.RenameColumn(
                name: "AuthorEmail",
                table: "Comments",
                newName: "GuestEmail");
        }
    }
}
