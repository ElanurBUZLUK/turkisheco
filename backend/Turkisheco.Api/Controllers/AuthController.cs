using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Turkisheco.Api.Data;
using Turkisheco.Api.Entities;

namespace Turkisheco.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public record RegisterRequest(string UserName, string Email, string Password, string? DisplayName);
        public record LoginRequest(string UserNameOrEmail, string Password);
        public record AuthResponse(string Token, int ForumUserId, string UserName, string DisplayName);
        public record AccountResponse(int Id, string UserName, string Email, string DisplayName, string? Bio, string? AvatarUrl);

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            if (await _db.ForumUsers.AnyAsync(u => u.UserName == request.UserName || u.Email == request.Email))
            {
                return BadRequest("Kullanıcı adı veya e-posta zaten kullanılıyor.");
            }

            var user = new ForumUser
            {
                UserName = request.UserName.Trim(),
                Email = request.Email.Trim(),
                DisplayName = string.IsNullOrWhiteSpace(request.DisplayName)
                    ? request.UserName.Trim()
                    : request.DisplayName.Trim()
            };

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            _db.ForumUsers.Add(user);
            await _db.SaveChangesAsync();

            var token = GenerateToken(user);

            return new AuthResponse(token, user.Id, user.UserName, user.DisplayName);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            var identifier = request.UserNameOrEmail.Trim();

            var user = await _db.ForumUsers
                .FirstOrDefaultAsync(u => u.UserName == identifier || u.Email == identifier);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized("Geçersiz kullanıcı adı/e-posta veya şifre.");
            }

            var token = GenerateToken(user);

            return new AuthResponse(token, user.Id, user.UserName, user.DisplayName);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<AccountResponse>> Me()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr))
                return Unauthorized();

            var id = int.Parse(userIdStr);
            var user = await _db.ForumUsers.FindAsync(id);
            if (user == null)
                return NotFound();

            return new AccountResponse(user.Id, user.UserName, user.Email, user.DisplayName, user.Bio, user.AvatarUrl);
        }

        private string GenerateToken(ForumUser user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Email, user.Email),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
