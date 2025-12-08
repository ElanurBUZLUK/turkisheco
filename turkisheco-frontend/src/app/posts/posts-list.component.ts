import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService } from '../services/post.service';
import { Post } from '../models/post';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './posts-list.component.html',
  styleUrl: './posts-list.component.scss',
})
export class PostsListComponent {
  private postService = inject(PostService);

  posts: Post[] = [];
  isLoading = false;
  error: string | null = null;

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

  onDelete(post: Post) {
    if (!confirm(`"${post.title}" yazısını silmek istediğine emin misin?`)) {
      return;
    }

    this.postService.delete(post.id).subscribe({
      next: () => {
        this.posts = this.posts.filter((p) => p.id !== post.id);
      },
      error: (err) => {
        console.error(err);
        alert('Silme sırasında bir hata oluştu.');
      },
    });
  }
}
