using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Turkisheco.Api.Entities
{
    public class Post
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Slug { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string ContentMarkdown { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Summary { get; set; }

        [MaxLength(500)]
        public string? CoverImageUrl { get; set; }

        [MaxLength(120)]
        public string? Category { get; set; }

        [Required]
        public string TagsJson { get; set; } = "[]";

        [Required]
        public string AuthorName { get; set; } = string.Empty;

        public int? AuthorId { get; set; }

        [Required]
        [MaxLength(40)]
        public string AuthorRole { get; set; } = "legacy";

        [Required]
        [MaxLength(40)]
        public string Status { get; set; } = "published";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public int? ReviewedByAdminId { get; set; }
        public string? ReviewNote { get; set; }
        public string? RejectionReason { get; set; }

        // Bu post’a ait yorumlar
        public List<Comment> Comments { get; set; } = new();
    }
}
