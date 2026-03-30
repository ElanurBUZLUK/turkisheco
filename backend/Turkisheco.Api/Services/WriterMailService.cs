using System.Net;
using System.Net.Mail;

namespace Turkisheco.Api.Services
{
    public record WriterMailSendResult(bool Delivered, string? DebugCode = null, string? ErrorMessage = null);

    public class WriterMailService
    {
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<WriterMailService> _logger;

        public WriterMailService(
            IConfiguration configuration,
            IWebHostEnvironment environment,
            ILogger<WriterMailService> logger)
        {
            _configuration = configuration;
            _environment = environment;
            _logger = logger;
        }

        public async Task<WriterMailSendResult> SendLoginCodeAsync(
            string username,
            string email,
            string code,
            DateTime expiresAtUtc,
            CancellationToken cancellationToken = default)
        {
            var host = _configuration["Mail:SmtpHost"];
            var fromEmail = _configuration["Mail:FromEmail"];

            if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(fromEmail))
            {
                if (_environment.IsDevelopment())
                {
                    _logger.LogInformation("Writer OTP for {Username}: {Code}", username, code);
                    return new WriterMailSendResult(true, code);
                }

                return new WriterMailSendResult(false, null, "Mail configuration is missing.");
            }

            var fromName = _configuration["Mail:FromName"] ?? "TurkishEco";
            var port = int.TryParse(_configuration["Mail:SmtpPort"], out var parsedPort) ? parsedPort : 587;
            var enableSsl = !bool.TryParse(_configuration["Mail:EnableSsl"], out var parsedSsl) || parsedSsl;
            var usernameCredential = _configuration["Mail:Username"];
            var passwordCredential = _configuration["Mail:Password"];

            using var message = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = "TurkishEco writer giriş kodu",
                Body =
$@"Merhaba {username},

Tek kullanımlık writer giriş kodun: {code}

Bu kod {expiresAtUtc:HH:mm} UTC saatine kadar geçerlidir.
Eğer bu işlemi sen başlatmadıysan bu e-postayı dikkate alma.",
                IsBodyHtml = false
            };

            message.To.Add(email);

            using var client = new SmtpClient(host, port)
            {
                EnableSsl = enableSsl
            };

            if (!string.IsNullOrWhiteSpace(usernameCredential))
            {
                client.Credentials = new NetworkCredential(usernameCredential, passwordCredential);
            }

            using var registration = cancellationToken.Register(client.SendAsyncCancel);

            try
            {
                await client.SendMailAsync(message);
                return new WriterMailSendResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send writer login code to {Email}", email);
                return new WriterMailSendResult(false, null, "Mail could not be delivered.");
            }
        }
    }
}
