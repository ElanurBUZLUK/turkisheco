using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Turkisheco.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCommentModerationFlag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPendingModeration",
                table: "Comments",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPendingModeration",
                table: "Comments");
        }
    }
}
