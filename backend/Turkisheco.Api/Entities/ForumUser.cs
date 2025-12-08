using System;
using System.Collections.Generic;

namespace Turkisheco.Api.Entities
{
    public class ForumUser
    {
        public int Id { get; set; }

        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;

        public string DisplayName { get; set; } = string.Empty;

        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public ICollection<ForumTopic> Topics { get; set; } = new List<ForumTopic>();

        // Eski forum thread yapısı için geriye dönük alan
        public ICollection<ForumThread> Threads { get; set; } = new List<ForumThread>();
    }
}
