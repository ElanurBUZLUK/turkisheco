using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Turkisheco.Api.Data;
using Turkisheco.Api.Entities;

namespace Turkisheco.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public CommentsController(AppDbContext db)
        {
            _db = db;
        }

        public record CommentDto(
            int Id,
            int PostId,
            string AuthorDisplayName,
            string Content,
            DateTime CreatedAt
        );

        public record CreateCommentRequest(
            string Content,
            string? AuthorName,
            string? AuthorEmail
        );

        [HttpGet("post/{postId:int}")]
        [HttpGet("/api/posts/{postId:int}/comments")]
        public async Task<ActionResult<IEnumerable<CommentDto>>> GetForPost(int postId)
        {
            var comments = await _db.Comments
                .Include(c => c.ForumUser)
                .Where(c => c.PostId == postId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            var result = comments.Select(c =>
                new CommentDto(
                    c.Id,
                    c.PostId,
                    c.ForumUser != null
                        ? c.ForumUser.DisplayName
                        : (c.AuthorName ?? "Misafir"),
                    c.Content,
                    c.CreatedAt
                ));

            return Ok(result);
        }

        [HttpPost("post/{postId:int}")]
        [HttpPost("/api/posts/{postId:int}/comments")]
        public async Task<ActionResult<CommentDto>> CreateForPost(int postId, CreateCommentRequest request)
        {
            var post = await _db.Posts.FindAsync(postId);
            if (post == null)
                return NotFound("Post bulunamadı.");

            if (string.IsNullOrWhiteSpace(request.Content))
                return BadRequest("Yorum metni boş olamaz.");

            var comment = new Comment
            {
                PostId = postId,
                Content = request.Content.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            if (User.Identity?.IsAuthenticated == true)
            {
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (int.TryParse(userIdStr, out var forumUserId))
                {
                    comment.ForumUserId = forumUserId;
                }
            }
            else
            {
                if (string.IsNullOrWhiteSpace(request.AuthorName) || string.IsNullOrWhiteSpace(request.AuthorEmail))
                    return BadRequest("Misafir yorumlar için isim ve e-posta zorunludur.");

                comment.AuthorName = request.AuthorName.Trim();
                comment.AuthorEmail = request.AuthorEmail.Trim();
            }

            _db.Comments.Add(comment);
            await _db.SaveChangesAsync();

            string authorDisplayName;
            if (comment.ForumUserId.HasValue)
            {
                var user = await _db.ForumUsers.FindAsync(comment.ForumUserId.Value);
                authorDisplayName = user?.DisplayName ?? "Kullanıcı";
            }
            else
            {
                authorDisplayName = comment.AuthorName ?? "Misafir";
            }

            var dto = new CommentDto(
                comment.Id,
                comment.PostId,
                authorDisplayName,
                comment.Content,
                comment.CreatedAt
            );

            return CreatedAtAction(nameof(GetForPost), new { postId }, dto);
        }
    }
}
