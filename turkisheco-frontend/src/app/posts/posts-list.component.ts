import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from '../services/post.service';
import { Post } from '../models/post';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.scss'],
})
export class PostsListComponent {
  private postService = inject(PostService);

  posts: Post[] = [];
  isLoading = false;
  error: string | null = null;
  searchQuery = '';

  get filteredPosts(): Post[] {
    if (!this.posts) {
      return [];
    }

    const q = this.searchQuery?.toLowerCase().trim();
    if (!q) {
      return this.posts;
    }

    return this.posts.filter((p) =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.contentMarkdown || '').toLowerCase().includes(q) ||
      (p.authorName || '').toLowerCase().includes(q)
    );
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading = true;
    this.error = null;

    this.postService.getAll().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Blog yazıları yüklenirken hata oluştu.';
        this.isLoading = false;
      },
    });
  }

  onDelete(postId: number) {
    const post = this.posts.find((p) => p.id === postId);
    const title = post?.title || `ID: ${postId}`;

    if (!confirm(`"${title}" yazısını silmek istediğine emin misin?`)) {
      return;
    }

    this.postService.delete(postId).subscribe({
      next: () => {
        this.posts = this.posts.filter((p) => p.id !== postId);
      },
      error: (err) => {
        console.error(err);
        alert('Silme sırasında bir hata oluştu.');
      },
    });
  }

  onSearch() {
    // Şimdilik filtreleme filteredPosts getter'ı ile yapılıyor.
  }
}
