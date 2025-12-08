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
    [Route("api/posts/{postId:int}/comments")]
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
            string? GuestName,
            string? GuestEmail,
            string Content,
            DateTime CreatedAt
        );

        public record CreateCommentRequest(
            string? GuestName,
            string? GuestEmail,
            string Content
        );

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CommentDto>>> GetForPost(int postId)
        {
            var exists = await _db.Posts.AnyAsync(p => p.Id == postId);
            if (!exists)
                return NotFound("Post bulunamadı.");

            var comments = await _db.Comments
                .Where(c => c.PostId == postId)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new CommentDto(
                    c.Id,
                    c.PostId,
                    c.GuestName,
                    c.GuestEmail,
                    c.Content,
                    c.CreatedAt
                ))
                .ToListAsync();

            return Ok(comments);
        }

        [HttpPost]
        public async Task<ActionResult<CommentDto>> Create(
            int postId,
            [FromBody] CreateCommentRequest request)
        {
            var post = await _db.Posts.FindAsync(postId);
            if (post == null)
                return NotFound("Post bulunamadı.");

            if (string.IsNullOrWhiteSpace(request.Content))
                return BadRequest("Yorum metni boş olamaz.");

            int? forumUserId = null;
            if (User.Identity?.IsAuthenticated == true)
            {
                var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(idClaim, out var parsed))
                {
                    forumUserId = parsed;
                }
            }

            if (forumUserId == null &&
                string.IsNullOrWhiteSpace(request.GuestName) &&
                string.IsNullOrWhiteSpace(request.GuestEmail))
            {
                return BadRequest("İsim veya e-posta (ya da giriş yapmış kullanıcı) gerekli.");
            }

            var comment = new Comment
            {
                PostId = postId,
                ForumUserId = forumUserId,
                GuestName = request.GuestName,
                GuestEmail = request.GuestEmail,
                Content = request.Content.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _db.Comments.Add(comment);
            await _db.SaveChangesAsync();

            var dto = new CommentDto(
                comment.Id,
                comment.PostId,
                comment.GuestName,
                comment.GuestEmail,
                comment.Content,
                comment.CreatedAt
            );

            return CreatedAtAction(
                nameof(GetForPost),
                new { postId },
                dto
            );
        }
    }
}
