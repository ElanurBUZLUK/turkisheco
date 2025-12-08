using System;
using System.Collections.Generic;

namespace Turkisheco.Api.Dto
{
    public class UserProfileDto
    {
        public int Id { get; set; }
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }

        public List<UserCommentDto> Comments { get; set; } = new();
        public List<UserTopicDto> Topics { get; set; } = new();
    }

    public class UserCommentDto
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }

    public class UserTopicDto
    {
        public int Id { get; set; }
        public string Slug { get; set; } = null!;
        public string Title { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateProfileDto
    {
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
    }
}
