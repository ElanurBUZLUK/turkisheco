import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostService } from '../services/post.service';
import { Post } from '../models/post';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="container">
      <a routerLink="/" class="back-link">← Ana sayfaya dön</a>

      <ng-container *ngIf="isLoading; else contentTpl">
        <p>Yükleniyor...</p>
      </ng-container>

      <ng-template #contentTpl>
        <p *ngIf="error" class="error">{{ error }}</p>

        <article *ngIf="post">
          <h1>{{ post.title }}</h1>
          <p class="meta">
            {{ post.authorName }} ·
            {{ post.createdAt | date: 'short' }}
          </p>
          <pre class="content">
{{ post.contentMarkdown }}
          </pre>
        </article>
      </ng-template>
    </section>
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
    private postService: PostService
  ) {}
}
