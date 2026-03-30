using System;
using System.Collections.Generic;

namespace Turkisheco.Api.Dto
{
    public record CreateWriterDto(string Username, string Email);

    public class AdminWriterDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
    }

    public class PostDto
    {
        public int Id { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string ContentMarkdown { get; set; } = string.Empty;
        public string? Summary { get; set; }
        public string? CoverImageUrl { get; set; }
        public string? Category { get; set; }
        public List<string> Tags { get; set; } = new();
        public string AuthorName { get; set; } = string.Empty;
        public int? AuthorId { get; set; }
        public string AuthorRole { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public int? ReviewedByAdminId { get; set; }
        public string? ReviewNote { get; set; }
        public string? RejectionReason { get; set; }
    }

    public class UpsertPostDto
    {
        public string Slug { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string ContentMarkdown { get; set; } = string.Empty;
        public string? Summary { get; set; }
        public string? CoverImageUrl { get; set; }
        public string? Category { get; set; }
        public List<string> Tags { get; set; } = new();
        public string? Status { get; set; }
    }

    public record ReviewActionDto(string? Note);
}
