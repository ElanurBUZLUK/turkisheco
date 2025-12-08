using System;
using System.ComponentModel.DataAnnotations;

namespace Turkisheco.Api.Entities
{
    public class Comment
    {
        public int Id { get; set; }

        [Required]
        public int PostId { get; set; }
        public Post? Post { get; set; }

        public string? UserId { get; set; }

        [MaxLength(100)]
        public string? DisplayName { get; set; }

        [MaxLength(256)]
        [EmailAddress]
        public string? Email { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
