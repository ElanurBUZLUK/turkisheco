using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Turkisheco.Api.Entities
{
    public class ForumUser
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public DateTime CreatedAt { get; set; }

        [JsonIgnore]
        public ICollection<ForumThread> Threads { get; set; } = new List<ForumThread>();
    }
}
