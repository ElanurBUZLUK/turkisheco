using System;

namespace Turkisheco.Api.Dto
{
    public class CommentDto
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string? AuthorEmail { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateCommentDto
    {
        public string AuthorName { get; set; } = string.Empty;
        public string? AuthorEmail { get; set; }
        public string Content { get; set; } = string.Empty;
    }
}
