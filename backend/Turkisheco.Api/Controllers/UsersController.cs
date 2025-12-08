using System.Linq;
using System.Threading.Tasks;
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

        [HttpGet("{id:int}")]
        public async Task<ActionResult<UserProfileDto>> GetById(int id)
        {
            var user = await _db.ForumUsers
                .Include(u => u.Comments)
                .Include(u => u.Topics)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound();

            var dto = new UserProfileDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                Bio = user.Bio,
                AvatarUrl = user.AvatarUrl,
                Comments = user.Comments
                    .OrderByDescending(c => c.CreatedAt)
                    .Select(c => new UserCommentDto
                    {
                        Id = c.Id,
                        PostId = c.PostId,
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
        public async Task<IActionResult> Update(int id, UpdateProfileDto dto)
        {
            var user = await _db.ForumUsers.FindAsync(id);
            if (user == null) return NotFound();

            user.Bio = dto.Bio;
            user.AvatarUrl = dto.AvatarUrl;

            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
