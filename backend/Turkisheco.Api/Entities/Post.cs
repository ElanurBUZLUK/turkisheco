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

        [Required]
        public string AuthorName { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Bu post’a ait yorumlar
        public List<Comment> Comments { get; set; } = new();
    }
}
