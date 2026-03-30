namespace Turkisheco.Api.Dto
{
    public record WriterAccessStatusDto(string Username, bool Exists, bool IsActive);
    public record RequestWriterCodeDto(string Username);
    public record RequestWriterCodeResponse(bool Success, int ExpiresInSeconds, int RetryAfterSeconds, string? DebugCode = null);
    public record VerifyWriterCodeDto(string Username, string Code);
    public record WriterAuthResponse(string Token, int WriterId, string Username, string Email);
}
