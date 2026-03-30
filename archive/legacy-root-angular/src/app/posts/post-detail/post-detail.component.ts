import { Component } from '@angular/core';
import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Post } from '../../models/post';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [NgIf, AsyncPipe, DatePipe, RouterLink],
  template: `
    <main class="post-detail">
      <a routerLink="/posts" class="back-link">← Tüm yazılar</a>

      <section *ngIf="post$ | async as post; else loading">
        <h1>{{ post.title }}</h1>

        <p class="meta">
          <strong>{{ post.authorName }}</strong>
          · {{ post.createdAt | date: 'medium' }}
        </p>

        <article class="content">
          {{ post.contentMarkdown }}
        </article>
      </section>

      <ng-template #loading>
        <p>Yazı yükleniyor...</p>
      </ng-template>
    </main>
  `,
})
export class PostDetailComponent {
  post$: Observable<Post>;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService
  ) {
    this.post$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = Number(params.get('id'));
        return this.postService.getPost(id);
      })
    );
  }
}
