import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService } from '../services/post.service';
import { Post } from '../models/post';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private postService = inject(PostService);

  posts: Post[] = [];
  isLoading = false;
  error: string | null = null;

  // Tasarım için ayrılmış alanlar
  heroPost: Post | null = null; // Sağdaki büyük kart
  sidePost: Post | null = null; // Soldaki dikey kart
  gridPosts: Post[] = []; // Alttaki küçük kartlar

  ngOnInit(): void {
    this.loadPosts();
  }

  private loadPosts(): void {
    this.isLoading = true;
    this.error = null;

    this.postService.getAll().subscribe({
      next: (posts) => {
        this.posts = posts;

        this.heroPost = posts.length > 0 ? posts[0] : null;
        this.sidePost = posts.length > 1 ? posts[1] : null;
        this.gridPosts = posts.slice(2); // geri kalanlar alt grid

        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Blog yazıları yüklenirken bir hata oluştu.';
        this.isLoading = false;
      },
    });
  }

  trackByPostId(index: number, post: Post): number {
    return post.id;
  }
}
