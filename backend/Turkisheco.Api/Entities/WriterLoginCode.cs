using System;

namespace Turkisheco.Api.Entities
{
    public class WriterLoginCode
    {
        public int Id { get; set; }
        public int WriterId { get; set; }
        public Writer Writer { get; set; } = null!;
        public string CodeHash { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public bool IsUsed { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UsedAt { get; set; }
        public int AttemptCount { get; set; }
    }
}
