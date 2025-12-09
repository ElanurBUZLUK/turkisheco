export interface Comment {
  id: number;
  postId: number;
  authorName: string;
  authorEmail?: string | null;
  content: string;
  createdAt: string;
}

export interface CreateCommentRequest {
  authorName: string;
  authorEmail?: string | null;
  content: string;
}
