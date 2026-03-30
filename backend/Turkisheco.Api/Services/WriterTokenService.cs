using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Turkisheco.Api.Entities;

namespace Turkisheco.Api.Services
{
    public class WriterTokenService
    {
        private readonly IConfiguration _configuration;

        public WriterTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(Writer writer)
        {
            var key = _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("Jwt:Key is not configured.");
            var issuer = _configuration["Jwt:Issuer"]
                ?? throw new InvalidOperationException("Jwt:Issuer is not configured.");
            var audience = _configuration["Jwt:Audience"]
                ?? throw new InvalidOperationException("Jwt:Audience is not configured.");

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, writer.Id.ToString()),
                new Claim(ClaimTypes.Name, writer.Username),
                new Claim(ClaimTypes.Email, writer.Email),
                new Claim(ClaimTypes.Role, "writer"),
                new Claim("actor_type", "writer"),
            };

            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(12),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
