using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Turkisheco.Api.Data;
using Turkisheco.Api.Dto;
using Turkisheco.Api.Entities;

namespace Turkisheco.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public PostsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PostDto>>> GetAll([FromQuery] string? status = null)
        {
            var query = _db.Posts
                .AsNoTracking()
                .Where(post => post.Status == "published");

            var posts = await query
                .OrderByDescending(post => post.PublishedAt ?? post.CreatedAt)
                .ToListAsync();

            return Ok(posts.Select(ToDto));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<PostDto>> GetById(int id)
        {
            var post = await _db.Posts.FirstOrDefaultAsync(post => post.Id == id);
            if (post == null)
            {
                return NotFound();
            }

            if (!CanReadPost(post))
            {
                return NotFound();
            }

            return Ok(ToDto(post));
        }

        [HttpGet("{id:int}/related")]
        public async Task<ActionResult<IEnumerable<PostDto>>> GetRelatedPosts(int id)
        {
            var relatedPosts = await _db.Posts
                .AsNoTracking()
                .Where(post => post.Id != id && post.Status == "published")
                .OrderByDescending(post => post.PublishedAt ?? post.CreatedAt)
                .Take(5)
                .ToListAsync();

            return Ok(relatedPosts.Select(ToDto));
        }

        [HttpGet("slug/{slug}")]
        public async Task<ActionResult<PostDto>> GetBySlug(string slug)
        {
            var post = await _db.Posts.FirstOrDefaultAsync(item => item.Slug == slug);
            if (post == null)
            {
                return NotFound();
            }

            if (!CanReadPost(post))
            {
                return NotFound();
            }

            return Ok(ToDto(post));
        }

        [HttpGet("mine")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<PostDto>>> GetMine([FromQuery] string? status = null)
        {
            var actor = await GetActorAsync();
            if (!actor.IsEditor)
            {
                return Forbid();
            }

            var query = _db.Posts
                .AsNoTracking()
                .Where(post => post.AuthorId == actor.Id && post.AuthorRole == actor.Role);

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(post => post.Status == status);
            }

            var posts = await query
                .OrderByDescending(post => post.UpdatedAt ?? post.CreatedAt)
                .ToListAsync();

            return Ok(posts.Select(ToDto));
        }

        [HttpGet("review-queue")]
        [Authorize(Roles = "super_admin")]
        public async Task<ActionResult<IEnumerable<PostDto>>> GetReviewQueue()
        {
            var posts = await _db.Posts
                .AsNoTracking()
                .Where(post => post.Status == "submitted_for_review" || post.Status == "approved")
                .OrderByDescending(post => post.UpdatedAt ?? post.CreatedAt)
                .ToListAsync();

            return Ok(posts.Select(ToDto));
        }

        [HttpGet("admin/all")]
        [Authorize(Roles = "super_admin")]
        public async Task<ActionResult<IEnumerable<PostDto>>> GetAdminAll([FromQuery] string? status = null)
        {
            var query = _db.Posts.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(post => post.Status == status);
            }

            var posts = await query
                .OrderByDescending(post => post.UpdatedAt ?? post.CreatedAt)
                .ToListAsync();

            return Ok(posts.Select(ToDto));
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<PostDto>> Create([FromBody] UpsertPostDto request)
        {
            var actor = await GetActorAsync();
            if (!actor.IsEditor)
            {
                return Forbid();
            }

            var slug = await GenerateUniqueSlugAsync(request.Slug, request.Title);
            var now = DateTime.UtcNow;
            var targetStatus = NormalizeRequestedStatus(actor, request.Status);

            var post = new Post
            {
                Title = request.Title.Trim(),
                Slug = slug,
                Summary = request.Summary?.Trim(),
                ContentMarkdown = request.ContentMarkdown.Trim(),
                CoverImageUrl = request.CoverImageUrl?.Trim(),
                Category = request.Category?.Trim(),
                TagsJson = SerializeTags(request.Tags),
                AuthorId = actor.Id,
                AuthorRole = actor.Role,
                AuthorName = actor.DisplayName,
                Status = targetStatus,
                CreatedAt = now,
                UpdatedAt = now,
                PublishedAt = targetStatus == "published" ? now : null,
                ReviewedByAdminId = actor.Role == "super_admin" && targetStatus == "published" ? actor.Id : null
            };

            _db.Posts.Add(post);
            await _db.SaveChangesAsync();

            return Ok(ToDto(post));
        }

        [HttpPut("{id:int}")]
        [Authorize]
        public async Task<ActionResult<PostDto>> Update(int id, [FromBody] UpsertPostDto request)
        {
            var actor = await GetActorAsync();
            if (!actor.IsEditor)
            {
                return Forbid();
            }

            var post = await _db.Posts.FirstOrDefaultAsync(item => item.Id == id);
            if (post == null)
            {
                return NotFound();
            }

            if (!CanManagePost(actor, post))
            {
                return Forbid();
            }

            post.Title = request.Title.Trim();
            post.Slug = await GenerateUniqueSlugAsync(request.Slug, request.Title, id);
            post.Summary = request.Summary?.Trim();
            post.ContentMarkdown = request.ContentMarkdown.Trim();
            post.CoverImageUrl = request.CoverImageUrl?.Trim();
            post.Category = request.Category?.Trim();
            post.TagsJson = SerializeTags(request.Tags);
            post.UpdatedAt = DateTime.UtcNow;

            var targetStatus = NormalizeRequestedStatus(actor, request.Status, post.Status);
            post.Status = targetStatus;

            if (targetStatus == "published" && post.PublishedAt == null)
            {
                post.PublishedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();
            return Ok(ToDto(post));
        }

        [HttpPost("{id:int}/submit")]
        [Authorize]
        public async Task<ActionResult<PostDto>> SubmitForReview(int id)
        {
            var actor = await GetActorAsync();
            if (actor.Role != "writer")
            {
                return Forbid();
            }

            var post = await _db.Posts.FirstOrDefaultAsync(item => item.Id == id);
            if (post == null)
            {
                return NotFound();
            }

            if (!CanManagePost(actor, post))
            {
                return Forbid();
            }

            post.Status = "submitted_for_review";
            post.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(ToDto(post));
        }

        [HttpPost("{id:int}/approve")]
        [Authorize(Roles = "super_admin")]
        public async Task<ActionResult<PostDto>> Approve(int id, [FromBody] ReviewActionDto request)
        {
            var adminId = GetCurrentUserId();
            var post = await _db.Posts.FirstOrDefaultAsync(item => item.Id == id);
            if (post == null)
            {
                return NotFound();
            }

            post.Status = "approved";
            post.ReviewNote = request.Note?.Trim();
            post.RejectionReason = null;
            post.ReviewedByAdminId = adminId;
            post.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(ToDto(post));
        }

        [HttpPost("{id:int}/reject")]
        [Authorize(Roles = "super_admin")]
        public async Task<ActionResult<PostDto>> Reject(int id, [FromBody] ReviewActionDto request)
        {
            var adminId = GetCurrentUserId();
            var post = await _db.Posts.FirstOrDefaultAsync(item => item.Id == id);
            if (post == null)
            {
                return NotFound();
            }

            post.Status = "rejected";
            post.ReviewNote = request.Note?.Trim();
            post.RejectionReason = request.Note?.Trim();
            post.ReviewedByAdminId = adminId;
            post.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(ToDto(post));
        }

        [HttpPost("{id:int}/publish")]
        [Authorize(Roles = "super_admin")]
        public async Task<ActionResult<PostDto>> Publish(int id, [FromBody] ReviewActionDto request)
        {
            var adminId = GetCurrentUserId();
            var post = await _db.Posts.FirstOrDefaultAsync(item => item.Id == id);
            if (post == null)
            {
                return NotFound();
            }

            post.Status = "published";
            post.ReviewNote = request.Note?.Trim();
            post.RejectionReason = null;
            post.ReviewedByAdminId = adminId;
            post.PublishedAt = DateTime.UtcNow;
            post.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(ToDto(post));
        }

        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var actor = await GetActorAsync();
            if (!actor.IsEditor)
            {
                return Forbid();
            }

            var post = await _db.Posts.FirstOrDefaultAsync(item => item.Id == id);
            if (post == null)
            {
                return NotFound();
            }

            if (!CanManagePost(actor, post))
            {
                return Forbid();
            }

            _db.Posts.Remove(post);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        private int? GetCurrentUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(value, out var id) ? id : null;
        }

        private async Task<ActorContext> GetActorAsync()
        {
            var actorId = GetCurrentUserId();
            if (actorId == null)
            {
                return ActorContext.None;
            }

            var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
            var actorType = User.FindFirstValue("actor_type") ?? string.Empty;

            if (role == "writer" || actorType == "writer")
            {
                var writer = await _db.Writers.FindAsync(actorId.Value);
                if (writer == null || !writer.IsActive)
                {
                    return ActorContext.None;
                }

                return new ActorContext(writer.Id, "writer", writer.Username, true);
            }

            if (role == "super_admin")
            {
                var admin = await _db.ForumUsers.FindAsync(actorId.Value);
                if (admin == null)
                {
                    return ActorContext.None;
                }

                var displayName = string.IsNullOrWhiteSpace(admin.DisplayName) ? admin.UserName : admin.DisplayName;
                return new ActorContext(admin.Id, "super_admin", displayName, true);
            }

            return ActorContext.None;
        }

        private bool CanReadPost(Post post)
        {
            if (post.Status == "published")
            {
                return true;
            }

            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return false;
            }

            var actorId = GetCurrentUserId();
            var actorRole = User.FindFirstValue(ClaimTypes.Role);

            if (actorRole == "super_admin")
            {
                return true;
            }

            return actorRole == post.AuthorRole && actorId == post.AuthorId;
        }

        private static bool CanManagePost(ActorContext actor, Post post)
        {
            if (actor.Role == "super_admin")
            {
                return true;
            }

            return actor.Role == post.AuthorRole && actor.Id == post.AuthorId;
        }

        private static string NormalizeRequestedStatus(ActorContext actor, string? requestedStatus, string? currentStatus = null)
        {
            var normalized = (requestedStatus ?? string.Empty).Trim().ToLowerInvariant();

            if (actor.Role == "super_admin")
            {
                return normalized switch
                {
                    "published" => "published",
                    "approved" => "approved",
                    "submitted_for_review" => "submitted_for_review",
                    "rejected" => "rejected",
                    _ => "draft",
                };
            }

            return normalized switch
            {
                "submitted_for_review" => "submitted_for_review",
                _ => currentStatus == "submitted_for_review" ? "submitted_for_review" : "draft",
            };
        }

        private async Task<string> GenerateUniqueSlugAsync(string? requestedSlug, string? title, int? currentPostId = null)
        {
            var baseSlug = Slugify(string.IsNullOrWhiteSpace(requestedSlug) ? title ?? string.Empty : requestedSlug);
            if (string.IsNullOrWhiteSpace(baseSlug))
            {
                baseSlug = $"post-{Guid.NewGuid():N}".Substring(0, 12);
            }

            var slug = baseSlug;
            var suffix = 1;

            while (await _db.Posts.AnyAsync(post => post.Slug == slug && post.Id != currentPostId))
            {
                slug = $"{baseSlug}-{suffix}";
                suffix++;
            }

            return slug;
        }

        private static string Slugify(string value)
        {
            var normalized = value.Trim().ToLowerInvariant()
                .Replace("ğ", "g")
                .Replace("ü", "u")
                .Replace("ş", "s")
                .Replace("ı", "i")
                .Replace("ö", "o")
                .Replace("ç", "c");

            var chars = normalized
                .Select(ch => char.IsLetterOrDigit(ch) ? ch : char.IsWhiteSpace(ch) || ch == '-' ? '-' : '\0')
                .Where(ch => ch != '\0')
                .ToArray();

            var compact = new string(chars);
            while (compact.Contains("--", StringComparison.Ordinal))
            {
                compact = compact.Replace("--", "-", StringComparison.Ordinal);
            }

            return compact.Trim('-');
        }

        private static string SerializeTags(IEnumerable<string>? tags)
        {
            var normalized = tags?
                .Select(tag => tag.Trim())
                .Where(tag => !string.IsNullOrWhiteSpace(tag))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList() ?? new List<string>();

            return JsonSerializer.Serialize(normalized);
        }

        private static List<string> ParseTags(string? tagsJson)
        {
            if (string.IsNullOrWhiteSpace(tagsJson))
            {
                return new List<string>();
            }

            try
            {
                return JsonSerializer.Deserialize<List<string>>(tagsJson) ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }

        private static PostDto ToDto(Post post)
        {
            return new PostDto
            {
                Id = post.Id,
                Slug = post.Slug,
                Title = post.Title,
                ContentMarkdown = post.ContentMarkdown,
                Summary = post.Summary,
                CoverImageUrl = post.CoverImageUrl,
                Category = post.Category,
                Tags = ParseTags(post.TagsJson),
                AuthorName = post.AuthorName,
                AuthorId = post.AuthorId,
                AuthorRole = post.AuthorRole,
                Status = post.Status,
                CreatedAt = post.CreatedAt,
                UpdatedAt = post.UpdatedAt,
                PublishedAt = post.PublishedAt,
                ReviewedByAdminId = post.ReviewedByAdminId,
                ReviewNote = post.ReviewNote,
                RejectionReason = post.RejectionReason
            };
        }

        private sealed record ActorContext(int Id, string Role, string DisplayName, bool IsEditor)
        {
            public static ActorContext None { get; } = new(0, string.Empty, string.Empty, false);
        }
    }
}
