using System;

namespace Turkisheco.Api.Entities
{
    // Şimdilik hem blog yazısı hem forum konusu için kullanılacak
    public class Post
    {
        public int Id { get; set; }

        // URL için kullanılacak (örn: /posts/why-turkish-dramas-are-addictive)
        public string Slug { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;

        // Markdown veya düz metin
        public string ContentMarkdown { get; set; } = string.Empty;

        // İleride User tablosuna bağlarız, şimdilik sadece string:
        public string AuthorName { get; set; } = "system";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
