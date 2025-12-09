export interface Post {
  id: number;
  slug: string;
  title: string;
  contentMarkdown: string;
  contentHtml?: string;
  authorName: string;
  createdAt: string;         // ISO formatında tarih
  updatedAt?: string | null; // null olabilir
}
