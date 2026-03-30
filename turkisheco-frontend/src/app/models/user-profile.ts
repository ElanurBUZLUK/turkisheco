export interface UserCommentSummary {
  id: number;
  postId: number;
  postSlug: string;
  content: string;
  createdAt: string;
}

export interface UserTopicSummary {
  id: number;
  slug: string;
  title: string;
  createdAt: string;
}

export interface UserProfile {
  id: number;
  userName: string;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  comments: UserCommentSummary[];
  topics: UserTopicSummary[];
}
