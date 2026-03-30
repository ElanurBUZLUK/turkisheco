using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Turkisheco.Api.Data;
using Turkisheco.Api.Entities;

namespace Turkisheco.Api.Controllers
{
    [ApiController]
    [Route("api/forum/threads")]
    public class ForumThreadsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ForumThreadsController(AppDbContext context)
        {
            _context = context;
        }

        private int? GetCurrentUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(userId, out var id) ? id : null;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ForumThread>>> GetAll()
        {
            var threads = await _context.ForumThreads
                .Include(t => t.ForumUser)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Ok(threads);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ForumThread>> GetById(int id)
        {
            var thread = await _context.ForumThreads
                .Include(t => t.ForumUser)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (thread == null) return NotFound();
            return Ok(thread);
        }

        [HttpGet("slug/{slug}")]
        public async Task<ActionResult<ForumThread>> GetBySlug(string slug)
        {
            var thread = await _context.ForumThreads
                .Include(t => t.ForumUser)
                .FirstOrDefaultAsync(t => t.Slug == slug);

            if (thread == null) return NotFound();
            return Ok(thread);
        }

        public class CreateForumThreadDto
        {
            public string Title { get; set; } = string.Empty;
            public string Content { get; set; } = string.Empty;
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ForumThread>> Create([FromBody] CreateForumThreadDto dto)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null) return Unauthorized();

            var user = await _context.ForumUsers.FindAsync(currentUserId.Value);
            if (user == null) return Unauthorized();

            var title = dto.Title?.Trim();
            if (string.IsNullOrWhiteSpace(title))
                return BadRequest("Başlık gerekli.");

            var content = dto.Content?.Trim();
            if (string.IsNullOrWhiteSpace(content))
                return BadRequest("İçerik gerekli.");

            var slugBase = Slugify(title);
            var slug = await GenerateUniqueSlug(slugBase);

            var thread = new ForumThread
            {
                Title = title,
                Content = content,
                CreatedAt = System.DateTime.UtcNow,
                ForumUserId = user.Id,
                Slug = slug
            };

            _context.ForumThreads.Add(thread);
            await _context.SaveChangesAsync();

            await _context.Entry(thread).Reference(t => t.ForumUser).LoadAsync();

            return CreatedAtAction(nameof(GetById), new { id = thread.Id }, thread);
        }

        private static string Slugify(string text)
        {
            text = text.ToLowerInvariant();
            text = text
                .Replace("ğ", "g").Replace("ü", "u").Replace("ş", "s")
                .Replace("ı", "i").Replace("ö", "o").Replace("ç", "c");

            text = Regex.Replace(text, "[^a-z0-9\\s-]", "");
            text = Regex.Replace(text, "\\s+", "-").Trim('-');
            return text;
        }

        private async Task<string> GenerateUniqueSlug(string baseSlug)
        {
            var slug = baseSlug;
            var suffix = 1;
            while (await _context.ForumThreads.AnyAsync(t => t.Slug == slug))
            {
                slug = $"{baseSlug}-{suffix}";
                suffix++;
            }
            return slug;
        }
    }
}
