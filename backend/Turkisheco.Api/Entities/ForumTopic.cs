using System;

namespace Turkisheco.Api.Entities
{
    public class ForumTopic
    {
        public int Id { get; set; }

        public string Title { get; set; } = null!;
        public string Slug { get; set; } = null!;
        public string ContentMarkdown { get; set; } = null!;

        public int AuthorId { get; set; }
        public ForumUser Author { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
