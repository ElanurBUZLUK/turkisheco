import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService } from '../services/post.service';
import { Post } from '../models/post';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private postService = inject(PostService);
  readonly auth = inject(AuthService);

  posts: Post[] = [];
  isLoading = false;
  error: string | null = null;

  get adminEntryRoute(): string {
    return this.auth.getAdminRoute();
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  private loadPosts(): void {
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
}
