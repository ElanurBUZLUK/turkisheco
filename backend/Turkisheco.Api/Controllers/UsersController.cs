using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Turkisheco.Api.Data;
using Turkisheco.Api.Dto;

namespace Turkisheco.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public UsersController(AppDbContext db)
        {
            _db = db;
        }

        private int? GetCurrentUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(userId, out var id) ? id : null;
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<PublicUserProfileDto>> GetById(int id)
        {
            var user = await _db.ForumUsers
                .Include(u => u.Comments)
                    .ThenInclude(c => c.Post)
                .Include(u => u.Topics)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound();

            var dto = new PublicUserProfileDto
            {
                Id = user.Id,
                UserName = user.UserName,
                DisplayName = user.DisplayName,
                Bio = user.Bio,
                AvatarUrl = user.AvatarUrl,
                Comments = user.Comments
                    .OrderByDescending(c => c.CreatedAt)
                    .Select(c => new UserCommentDto
                    {
                        Id = c.Id,
                        PostId = c.PostId,
                        PostSlug = c.Post.Slug,
                        Content = c.Content,
                        CreatedAt = c.CreatedAt
                    }).ToList(),
                Topics = user.Topics
                    .OrderByDescending(t => t.CreatedAt)
                    .Select(t => new UserTopicDto
                    {
                        Id = t.Id,
                        Slug = t.Slug,
                        Title = t.Title,
                        CreatedAt = t.CreatedAt
                    }).ToList()
            };

            return dto;
        }

        [HttpPut("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, UpdateProfileDto dto)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
            {
                return Unauthorized();
            }

            if (currentUserId.Value != id)
            {
                return Forbid();
            }

            var user = await _db.ForumUsers.FindAsync(id);
            if (user == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(dto.DisplayName))
            {
                user.DisplayName = dto.DisplayName.Trim();
            }

            user.Bio = dto.Bio;
            user.AvatarUrl = dto.AvatarUrl;

            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
