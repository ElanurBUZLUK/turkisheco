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
            string? DisplayName,
            string? Email,
            string Content,
            DateTime CreatedAt
        );

        public record CreateCommentRequest(
            string? DisplayName,
            string? Email,
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
                    c.DisplayName,
                    c.Email,
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

            string? userId = null;
            if (User.Identity?.IsAuthenticated == true)
            {
                userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            }

            if (userId == null &&
                string.IsNullOrWhiteSpace(request.DisplayName) &&
                string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest("İsim veya e-posta (ya da giriş yapmış kullanıcı) gerekli.");
            }

            var comment = new Comment
            {
                PostId = postId,
                UserId = userId,
                DisplayName = request.DisplayName,
                Email = request.Email,
                Content = request.Content.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _db.Comments.Add(comment);
            await _db.SaveChangesAsync();

            var dto = new CommentDto(
                comment.Id,
                comment.PostId,
                comment.DisplayName,
                comment.Email,
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
