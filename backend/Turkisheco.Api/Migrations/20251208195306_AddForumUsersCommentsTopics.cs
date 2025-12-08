using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Turkisheco.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddForumUsersCommentsTopics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Comments");

            migrationBuilder.RenameColumn(
                name: "Email",
                table: "Comments",
                newName: "GuestEmail");

            migrationBuilder.RenameColumn(
                name: "DisplayName",
                table: "Comments",
                newName: "GuestName");

            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "ForumUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "ForumUsers",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ForumUserId",
                table: "Comments",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ForumTopics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Slug = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ContentMarkdown = table.Column<string>(type: "text", nullable: false),
                    AuthorId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ForumTopics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ForumTopics_ForumUsers_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "ForumUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ForumUsers_Email",
                table: "ForumUsers",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Comments_ForumUserId",
                table: "Comments",
                column: "ForumUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ForumTopics_AuthorId",
                table: "ForumTopics",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_ForumTopics_Slug",
                table: "ForumTopics",
                column: "Slug",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_ForumUsers_ForumUserId",
                table: "Comments",
                column: "ForumUserId",
                principalTable: "ForumUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Comments_ForumUsers_ForumUserId",
                table: "Comments");

            migrationBuilder.DropTable(
                name: "ForumTopics");

            migrationBuilder.DropIndex(
                name: "IX_ForumUsers_Email",
                table: "ForumUsers");

            migrationBuilder.DropIndex(
                name: "IX_Comments_ForumUserId",
                table: "Comments");

            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "ForumUsers");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "ForumUsers");

            migrationBuilder.DropColumn(
                name: "ForumUserId",
                table: "Comments");

            migrationBuilder.RenameColumn(
                name: "GuestName",
                table: "Comments",
                newName: "DisplayName");

            migrationBuilder.RenameColumn(
                name: "GuestEmail",
                table: "Comments",
                newName: "Email");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Comments",
                type: "text",
                nullable: true);
        }
    }
}
