using System;
using System.Collections.Generic;

namespace Turkisheco.Api.Entities
{
    public class Writer
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? CreatedByAdminId { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public DateTime? LastCodeSentAt { get; set; }
        public int FailedAttempts { get; set; }

        public ICollection<WriterLoginCode> LoginCodes { get; set; } = new List<WriterLoginCode>();
    }
}
