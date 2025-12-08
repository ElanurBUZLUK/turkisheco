export interface Comment {
  id: number;
  postId: number;
  displayName?: string | null;
  email?: string | null;
  content: string;
  createdAt: string;
}
