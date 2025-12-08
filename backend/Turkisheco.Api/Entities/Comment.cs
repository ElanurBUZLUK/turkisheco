using System;
using System.ComponentModel.DataAnnotations;

namespace Turkisheco.Api.Entities
{
    public class Comment
    {
        public int Id { get; set; }

        [Required]
        public int PostId { get; set; }
        public Post Post { get; set; } = null!;

        public int? ForumUserId { get; set; }
        public ForumUser? ForumUser { get; set; }

        public string? AuthorName { get; set; }
        public string? AuthorEmail { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
