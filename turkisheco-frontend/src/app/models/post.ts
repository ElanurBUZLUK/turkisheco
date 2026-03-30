export interface Post {
  id: number;
  slug: string;
  title: string;
  contentMarkdown: string;
  summary?: string | null;
  coverImageUrl?: string | null;
  category?: string | null;
  tags: string[];
  contentHtml?: string;
  authorName: string;
  authorId?: number | null;
  authorRole: string;
  status: string;
  createdAt: string;         // ISO formatında tarih
  updatedAt?: string | null; // null olabilir
  publishedAt?: string | null;
  reviewedByAdminId?: number | null;
  reviewNote?: string | null;
  rejectionReason?: string | null;
}
