using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Turkisheco.Api.Data;
using Turkisheco.Api.Dto;
using Turkisheco.Api.Entities;
using Turkisheco.Api.Services;

namespace Turkisheco.Api.Controllers
{
    [ApiController]
    [Route("api/writer-access")]
    public class WriterAccessController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly WriterCodeHasher _codeHasher;
        private readonly WriterMailService _mailService;
        private readonly WriterTokenService _tokenService;

        public WriterAccessController(
            AppDbContext db,
            WriterCodeHasher codeHasher,
            WriterMailService mailService,
            WriterTokenService tokenService)
        {
            _db = db;
            _codeHasher = codeHasher;
            _mailService = mailService;
            _tokenService = tokenService;
        }

        [HttpGet("{username}")]
        public async Task<ActionResult<WriterAccessStatusDto>> GetStatus(string username)
        {
            var normalizedUsername = NormalizeUsername(username);
            if (string.IsNullOrWhiteSpace(normalizedUsername))
            {
                return BadRequest("Geçersiz kullanıcı adı.");
            }

            var writer = await _db.Writers
                .AsNoTracking()
                .FirstOrDefaultAsync(w => w.Username.ToLower() == normalizedUsername.ToLower());

            if (writer == null)
            {
                return NotFound(new WriterAccessStatusDto(normalizedUsername, false, false));
            }

            return Ok(new WriterAccessStatusDto(writer.Username, true, writer.IsActive));
        }

        [HttpPost("request-code")]
        public async Task<ActionResult<RequestWriterCodeResponse>> RequestCode([FromBody] RequestWriterCodeDto request, CancellationToken cancellationToken)
        {
            var normalizedUsername = NormalizeUsername(request.Username);
            if (string.IsNullOrWhiteSpace(normalizedUsername))
            {
                return BadRequest("Kullanıcı adı zorunludur.");
            }

            var writer = await _db.Writers
                .FirstOrDefaultAsync(w => w.Username.ToLower() == normalizedUsername.ToLower(), cancellationToken);

            if (writer == null)
            {
                return NotFound("Writer bulunamadı.");
            }

            if (!writer.IsActive)
            {
                return BadRequest("Writer hesabı pasif.");
            }

            var now = DateTime.UtcNow;
            if (writer.LastCodeSentAt.HasValue && writer.LastCodeSentAt.Value > now.AddMinutes(-1))
            {
                var retryAfter = (int)Math.Ceiling((writer.LastCodeSentAt.Value.AddMinutes(1) - now).TotalSeconds);
                return StatusCode(StatusCodes.Status429TooManyRequests,
                    new RequestWriterCodeResponse(false, 600, retryAfter));
            }

            var recentCodeCount = await _db.WriterLoginCodes
                .CountAsync(
                    code => code.WriterId == writer.Id && code.CreatedAt > now.AddMinutes(-10),
                    cancellationToken);

            if (recentCodeCount >= 3)
            {
                return StatusCode(StatusCodes.Status429TooManyRequests,
                    new RequestWriterCodeResponse(false, 600, 600));
            }

            var code = Random.Shared.Next(100000, 999999).ToString();
            var expiresAt = now.AddMinutes(10);

            var loginCode = new WriterLoginCode
            {
                WriterId = writer.Id,
                CodeHash = _codeHasher.HashCode(writer.Id, code),
                ExpiresAt = expiresAt,
                CreatedAt = now,
                AttemptCount = 0,
                IsUsed = false
            };

            writer.LastCodeSentAt = now;

            _db.WriterLoginCodes.Add(loginCode);
            await _db.SaveChangesAsync(cancellationToken);

            var mailResult = await _mailService.SendLoginCodeAsync(
                writer.Username,
                writer.Email,
                code,
                expiresAt,
                cancellationToken);

            if (!mailResult.Delivered)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, mailResult.ErrorMessage ?? "Kod gönderilemedi.");
            }

            return Ok(new RequestWriterCodeResponse(
                true,
                600,
                60,
                mailResult.DebugCode));
        }

        [HttpPost("verify-code")]
        public async Task<ActionResult<WriterAuthResponse>> VerifyCode([FromBody] VerifyWriterCodeDto request, CancellationToken cancellationToken)
        {
            var normalizedUsername = NormalizeUsername(request.Username);
            var normalizedCode = request.Code?.Trim();

            if (string.IsNullOrWhiteSpace(normalizedUsername) || string.IsNullOrWhiteSpace(normalizedCode))
            {
                return BadRequest("Kullanıcı adı ve kod zorunludur.");
            }

            var writer = await _db.Writers
                .Include(w => w.LoginCodes)
                .FirstOrDefaultAsync(w => w.Username.ToLower() == normalizedUsername.ToLower(), cancellationToken);

            if (writer == null)
            {
                return NotFound("Writer bulunamadı.");
            }

            if (!writer.IsActive)
            {
                return BadRequest("Writer hesabı pasif.");
            }

            var now = DateTime.UtcNow;
            var loginCode = writer.LoginCodes
                .OrderByDescending(code => code.CreatedAt)
                .FirstOrDefault();

            if (loginCode == null)
            {
                return BadRequest("Aktif giriş kodu bulunamadı.");
            }

            if (loginCode.IsUsed)
            {
                return BadRequest("Kod daha önce kullanıldı.");
            }

            if (loginCode.ExpiresAt <= now)
            {
                return BadRequest("Kod süresi doldu.");
            }

            if (loginCode.AttemptCount >= 5)
            {
                return StatusCode(StatusCodes.Status429TooManyRequests, "Çok fazla yanlış deneme yapıldı.");
            }

            loginCode.AttemptCount += 1;

            var expectedHash = _codeHasher.HashCode(writer.Id, normalizedCode);
            if (!string.Equals(loginCode.CodeHash, expectedHash, StringComparison.Ordinal))
            {
                writer.FailedAttempts += 1;
                await _db.SaveChangesAsync(cancellationToken);
                return BadRequest("Kod yanlış.");
            }

            loginCode.IsUsed = true;
            loginCode.UsedAt = now;
            writer.LastLoginAt = now;
            writer.FailedAttempts = 0;

            await _db.SaveChangesAsync(cancellationToken);

            var token = _tokenService.GenerateToken(writer);
            return Ok(new WriterAuthResponse(token, writer.Id, writer.Username, writer.Email));
        }

        private static string NormalizeUsername(string? username)
        {
            return username?.Trim().Trim('/').ToLowerInvariant() ?? string.Empty;
        }
    }
}
