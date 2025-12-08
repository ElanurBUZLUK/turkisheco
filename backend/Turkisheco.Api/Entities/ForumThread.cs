using System;

namespace Turkisheco.Api.Entities
{
    public class ForumThread
    {
        public int Id { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public int ForumUserId { get; set; }
        public ForumUser? ForumUser { get; set; }
    }
}
