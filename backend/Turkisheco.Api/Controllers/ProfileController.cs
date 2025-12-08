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
    public class ProfileController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ProfileController(AppDbContext db)
        {
            _db = db;
        }

        private string? GetCurrentUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

        // GET: /api/profile/me
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserProfileDto>> GetMe()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            if (!int.TryParse(userId, out var id)) return Unauthorized();

            var user = await _db.ForumUsers.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();

            var dto = new UserProfileDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                DisplayName = user.DisplayName,
                Bio = user.Bio,
                AvatarUrl = user.AvatarUrl
            };

            return Ok(dto);
        }

        // PUT: /api/profile/me
        [HttpPut("me")]
        [Authorize]
        public async Task<ActionResult<UserProfileDto>> UpdateMe([FromBody] UpdateProfileDto model)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            if (!int.TryParse(userId, out var id)) return Unauthorized();

            var user = await _db.ForumUsers.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(model.DisplayName))
            {
                user.DisplayName = model.DisplayName.Trim();
            }

            user.Bio = model.Bio;
            user.AvatarUrl = model.AvatarUrl;

            await _db.SaveChangesAsync();

            var dto = new UserProfileDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                DisplayName = user.DisplayName,
                Bio = user.Bio,
                AvatarUrl = user.AvatarUrl
            };

            return Ok(dto);
        }
    }
}
