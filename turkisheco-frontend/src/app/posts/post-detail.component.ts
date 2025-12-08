import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Post } from '../models/post';
import { Comment } from '../models/comment';
import { PostService } from '../services/post.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="post-detail-container" *ngIf="!isLoading && post; else loadingOrError">
      <div class="layout">
        <!-- Ana içerik -->
        <article class="post-main">
          <a routerLink="/" class="back-link">← Anasayfa</a>

          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-meta">
            <span>{{ post.authorName }}</span>
            <span>·</span>
            <span>{{ post.createdAt | date: 'mediumDate' }}</span>
          </div>

          <div class="post-content">
            <pre>{{ post.contentMarkdown }}</pre>
          </div>

          <!-- YORUMLAR -->
          <section class="comments">
            <h2>Yorumlar</h2>

            <!-- Yorum listesi -->
            <div *ngIf="isLoadingComments">Yorumlar yükleniyor...</div>
            <div *ngIf="!isLoadingComments && comments.length === 0">
              Henüz yorum yok. İlk yorumu sen yaz 🙂
            </div>

            <ul *ngIf="comments.length > 0" class="comment-list">
              <li *ngFor="let c of comments" class="comment-item">
                <div class="comment-header">
                  <strong>{{ c.displayName || 'Anonim' }}</strong>
                  <span class="comment-date">
                    · {{ c.createdAt | date: 'short' }}
                  </span>
                </div>
                <div class="comment-body">
                  {{ c.content }}
                </div>
                <div class="comment-email" *ngIf="c.email">
                  {{ c.email }}
                </div>
              </li>
            </ul>

            <!-- Yeni yorum formu -->
            <form (ngSubmit)="submitComment()" class="comment-form">
              <h3>Yorum Yaz</h3>

              <div class="form-row">
                <label>
                  İsim (isteğe bağlı)
                  <input
                    type="text"
                    [(ngModel)]="newComment.displayName"
                    name="displayName"
                  />
                </label>

                <label>
                  E-posta (isteğe bağlı)
                  <input
                    type="email"
                    [(ngModel)]="newComment.email"
                    name="email"
                  />
                </label>
              </div>

              <label class="form-textarea">
                Yorum <span class="required">*</span>
                <textarea
                  [(ngModel)]="newComment.content"
                  name="content"
                  rows="4"
                  required
                ></textarea>
              </label>

              <div *ngIf="commentError" class="error">
                {{ commentError }}
              </div>

              <button type="submit" [disabled]="isSavingComment || !newComment.content.trim()">
                {{ isSavingComment ? 'Kaydediliyor...' : 'Yorumu Gönder' }}
              </button>
            </form>
          </section>
        </article>

        <!-- Sağ tarafta öneriler -->
        <aside class="sidebar">
          <h3>Diğer yazılar</h3>
          <div *ngIf="recommendedPosts.length === 0">
            Henüz başka yazı yok.
          </div>
          <ul *ngIf="recommendedPosts.length > 0">
            <li *ngFor="let p of recommendedPosts">
              <a [routerLink]="['/posts', p.slug]">
                {{ p.title }}
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </div>

    <ng-template #loadingOrError>
      <div *ngIf="error" class="error">
        {{ error }}
      </div>
      <div *ngIf="!error">
        Yükleniyor...
      </div>
    </ng-template>
  `,
  styles: [`
    .layout {
      display: flex;
      gap: 2rem;
      align-items: flex-start;
    }

    .post-main {
      flex: 3;
    }

    .sidebar {
      flex: 1;
      max-width: 320px;
      border-left: 1px solid #ddd;
      padding-left: 1rem;
    }

    .post-title {
      margin-top: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .post-meta {
      color: #666;
      font-size: 0.9rem;
      display: flex;
      gap: 0.5rem;
      align-items:  center;
      margin-bottom: 1rem;
    }

    .post-content pre {
      white-space: pre-wrap;
      font-family: inherit;
    }

    .comments {
      margin-top: 2rem;
      border-top: 1px solid #ddd;
      padding-top: 1rem;
    }

    .comment-list {
      list-style: none;
      padding: 0;
      margin: 0 0 1.5rem 0;
    }

    .comment-item {
      border-bottom: 1px solid #eee;
      padding: 0.5rem 0;
    }

    .comment-header {
      font-size: 0.9rem;
      color: #333;
      margin-bottom: 0.25rem;
    }

    .comment-date {
      color: #888;
      margin-left: 0.25rem;
    }

    .comment-email {
      font-size: 0.8rem;
      color: #777;
    }

    .comment-form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .form-row label {
      flex: 1;
      display: flex;
      flex-direction: column;
      font-size: 0.9rem;
    }

    .form-textarea {
      display: flex;
      flex-direction: column;
      font-size: 0.9rem;
    }

    input, textarea {
      margin-top: 0.25rem;
      padding: 0.4rem 0.5rem;
      border-radius: 4px;
      border: 1px solid #ccc;
      font: inherit;
    }

    button {
      align-self: flex-start;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      border: none;
      background: #1976d2;
      color: #fff;
      cursor: pointer;
    }

    button[disabled] {
      opacity: 0.5;
      cursor: default;
    }

    .back-link {
      font-size: 0.9rem;
      text-decoration: none;
      color: #1976d2;
    }

    .error {
      color: #b00020;
      font-size: 0.9rem;
    }

    .required {
      color: #b00020;
    }

    @media (max-width: 900px) {
      .layout {
        flex-direction: column;
      }

      .sidebar {
        max-width: none;
        border-left: none;
        border-top: 1px solid #ddd;
        padding-left: 0;
        padding-top: 1rem;
      }
    }
  `]
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  comments: Comment[] = [];
  recommendedPosts: Post[] = [];

  isLoading = true;
  error: string | null = null;

  isLoadingComments = true;
  isSavingComment = false;
  commentError: string | null = null;

  newComment = {
    displayName: '',
    email: '',
    content: ''
  };

  private postId!: number;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');

      if (!slug) {
        this.error = 'Geçersiz yazı slug.';
        this.isLoading = false;
        return;
      }

      this.loadPost(slug);
    });
  }

  private loadPost(slug: string) {
    this.isLoading = true;
    this.error = null;

    this.postService.getBySlug(slug).subscribe({
      next: post => {
        this.post = post;
        this.postId = post.id;
        this.isLoading = false;
        this.loadComments(post.id);
        this.loadRecommended(post.id);
      },
      error: () => {
        this.error = 'Yazı yüklenirken bir hata oluştu.';
        this.isLoading = false;
      }
    });
  }

  private loadComments(postId: number) {
    this.isLoadingComments = true;

    this.postService.getComments(postId).subscribe({
      next: comments => {
        this.comments = comments;
        this.isLoadingComments = false;
      },
      error: () => {
        this.isLoadingComments = false;
      }
    });
  }

  private loadRecommended(currentPostId: number) {
    this.postService.getAll().subscribe({
      next: posts => {
        this.recommendedPosts = posts.filter(p => p.id !== currentPostId).slice(0, 5);
      },
      error: () => {
        this.recommendedPosts = [];
      }
    });
  }

  submitComment() {
    this.commentError = null;

    const content = this.newComment.content?.trim();
    if (!content) {
      this.commentError = 'Yorum metni boş olamaz.';
      return;
    }

    this.isSavingComment = true;

    this.postService.addComment(this.postId, {
      displayName: this.newComment.displayName || undefined,
      email: this.newComment.email || undefined,
      content
    }).subscribe({
      next: created => {
        this.comments.unshift(created);
        this.newComment.content = '';
        this.isSavingComment = false;
      },
      error: () => {
        this.commentError = 'Yorum kaydedilirken bir hata oluştu.';
        this.isSavingComment = false;
      }
    });
  }
}
