import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostService } from '../services/post.service';
import { Post } from '../models/post';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="post-detail">
      <a routerLink="/" class="back-link">← Listeye dön</a>

      <div *ngIf="isLoading">Yükleniyor...</div>
      <div *ngIf="!isLoading && error" class="error">{{ error }}</div>

      <div class="container" *ngIf="!isLoading && post">
        <button type="button" (click)="goBack()">← Yazı listesine dön</button>

        <h1>{{ post.title }}</h1>

        <p class="meta">
          {{ post.authorName }} ·
          {{ post.createdAt | date: 'medium' }}
        </p>

        <pre class="content">
{{ post.contentMarkdown }}
        </pre>
      </div>
    </main>
  `,
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  isLoading = false;
  error: string | null = null;

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
      this.error = 'Geçersiz yazı adresi.';
      return;
    }

    this.isLoading = true;

    this.postService.getBySlug(slug).subscribe({
      next: (post) => {
        this.post = post;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Yazı bulunamadı.';
        this.isLoading = false;
      },
    });
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService
  ) {}

  goBack(): void {
    this.router.navigate(['/']);
  }
}
