using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Turkisheco.Api.Data;
using Turkisheco.Api.Dto;
using Turkisheco.Api.Entities;
using System.Security.Claims;

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

        [HttpGet]
        [HttpGet("/api/comments/post/{postId:int}")]
        public async Task<ActionResult<IEnumerable<CommentDto>>> GetForPost(int postId)
        {
            var comments = await _db.Comments
                .Include(c => c.ForumUser)
                .Where(c => c.PostId == postId)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new CommentDto
                {
                    Id = c.Id,
                    PostId = c.PostId,
                    AuthorName = c.ForumUser != null
                        ? (c.ForumUser.DisplayName ?? c.ForumUser.UserName)
                        : (c.AuthorName ?? "Misafir"),
                    AuthorEmail = c.AuthorEmail,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();

            return Ok(comments);
        }

        [HttpPost]
        [HttpPost("/api/comments/post/{postId:int}")]
        public async Task<ActionResult<CommentDto>> Create(int postId, [FromBody] CreateCommentDto dto)
        {
            var postExists = await _db.Posts.AnyAsync(p => p.Id == postId);
            if (!postExists)
                return NotFound("Post bulunamadı.");

            if (string.IsNullOrWhiteSpace(dto.Content))
                return BadRequest("Yorum metni boş olamaz.");

            var comment = new Comment
            {
                PostId = postId,
                Content = dto.Content.Trim(),
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
                var authorName = dto.AuthorName?.Trim();
                if (string.IsNullOrWhiteSpace(authorName))
                    return BadRequest("Misafir yorumlar için isim zorunludur.");

                comment.AuthorName = authorName;
                comment.AuthorEmail = dto.AuthorEmail?.Trim();
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

            var result = new CommentDto
            {
                Id = comment.Id,
                PostId = comment.PostId,
                AuthorName = authorDisplayName,
                AuthorEmail = comment.AuthorEmail,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt
            };

            return CreatedAtAction(nameof(GetForPost), new { postId }, result);
        }
    }
}
