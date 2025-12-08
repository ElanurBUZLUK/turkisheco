export interface UserCommentSummary {
  id: number;
  postId: number;
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
  email: string;
  bio?: string | null;
  avatarUrl?: string | null;
  comments: UserCommentSummary[];
  topics: UserTopicSummary[];
}
