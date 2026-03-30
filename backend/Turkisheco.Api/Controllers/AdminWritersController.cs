using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Turkisheco.Api.Data;
using Turkisheco.Api.Dto;
using Turkisheco.Api.Entities;

namespace Turkisheco.Api.Controllers
{
    [ApiController]
    [Route("api/admin/writers")]
    [Authorize(Roles = "super_admin")]
    public class AdminWritersController : ControllerBase
    {
        private static readonly HashSet<string> ReservedUsernames = new(StringComparer.OrdinalIgnoreCase)
        {
            "admin",
            "about",
            "contact",
            "posts",
            "forum",
            "login",
            "register",
            "account",
            "api",
            "w"
        };

        private readonly AppDbContext _db;

        public AdminWritersController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AdminWriterDto>>> GetAll()
        {
            var writers = await _db.Writers
                .OrderByDescending(writer => writer.CreatedAt)
                .Select(writer => new AdminWriterDto
                {
                    Id = writer.Id,
                    Username = writer.Username,
                    Email = writer.Email,
                    IsActive = writer.IsActive,
                    CreatedAt = writer.CreatedAt,
                    LastLoginAt = writer.LastLoginAt
                })
                .ToListAsync();

            return Ok(writers);
        }

        [HttpPost]
        public async Task<ActionResult<AdminWriterDto>> Create([FromBody] CreateWriterDto request)
        {
            var username = request.Username.Trim().ToLowerInvariant();
            var email = request.Email.Trim();

            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(email))
            {
                return BadRequest("Username ve email zorunludur.");
            }

            if (ReservedUsernames.Contains(username))
            {
                return BadRequest("Bu kullanıcı adı sistem route'ları için ayrılmış durumda.");
            }

            if (await _db.Writers.AnyAsync(writer => writer.Username.ToLower() == username))
            {
                return BadRequest("Bu kullanıcı adı zaten kullanılıyor.");
            }

            if (await _db.Writers.AnyAsync(writer => writer.Email.ToLower() == email.ToLower()))
            {
                return BadRequest("Bu e-posta zaten kullanılıyor.");
            }

            var adminId = GetCurrentAdminId();

            var writer = new Writer
            {
                Username = username,
                Email = email,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedByAdminId = adminId
            };

            _db.Writers.Add(writer);
            await _db.SaveChangesAsync();

            return Ok(new AdminWriterDto
            {
                Id = writer.Id,
                Username = writer.Username,
                Email = writer.Email,
                IsActive = writer.IsActive,
                CreatedAt = writer.CreatedAt,
                LastLoginAt = writer.LastLoginAt
            });
        }

        private int? GetCurrentAdminId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(userId, out var id) ? id : null;
        }
    }
}
