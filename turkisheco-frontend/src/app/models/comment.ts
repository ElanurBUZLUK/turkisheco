export interface Comment {
  id: number;
  postId: number;
  authorName: string;
  authorEmail?: string | null;
  content: string;
  createdAt: string;
  isPendingModeration?: boolean;
}

export interface CreateCommentRequest {
  authorName: string;
  authorEmail?: string | null;
  content: string;
  website?: string | null;
}
