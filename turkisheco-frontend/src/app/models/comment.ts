export interface Comment {
  id: number;
  postId: number;
  guestName?: string | null;
  guestEmail?: string | null;
  content: string;
  createdAt: string;
}
