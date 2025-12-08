import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post';

@Component({
  selector: 'app-post-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="post-create">
      <a routerLink="/" class="back-link">← Tüm yazılar</a>

      <h1>Yeni Yazı Oluştur</h1>

      <form [formGroup]="form" (ngSubmit)="save()">
        <label>
          Başlık
          <input type="text" formControlName="title" (blur)="generateSlug()" />
        </label>

        <label>
          Slug (URL)
          <input type="text" formControlName="slug" />
        </label>

        <label>
          Yazar Adı
          <input type="text" formControlName="authorName" />
        </label>

        <label>
          İçerik (Markdown)
          <textarea rows="8" formControlName="contentMarkdown"></textarea>
        </label>

        <button type="submit" [disabled]="isSaving || form.invalid">
          {{ isSaving ? 'Kaydediliyor...' : 'Kaydet' }}
        </button>

        <p class="error" *ngIf="error">{{ error }}</p>
      </form>
    </div>
  `,
})
export class PostCreateComponent {
  form: FormGroup;
  isSaving = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      slug: ['', Validators.required],
      authorName: ['Ela'],
      contentMarkdown: ['', Validators.required],
    });
  }

  generateSlug() {
    const title = this.form.get('title')?.value as string;
    if (!title) return;

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ\s-]/g, '')
      .replace(/\s+/g, '-');

    this.form.get('slug')?.setValue(slug);
  }

  save() {
    this.error = null;
    this.isSaving = true;

    if (this.form.invalid) {
      this.error = 'Başlık, slug ve içerik zorunludur.';
      this.isSaving = false;
      return;
    }

    const value = this.form.value;

    const payload: Partial<Post> = {
      title: value.title,
      slug: value.slug,
      contentMarkdown: value.contentMarkdown,
      authorName: value.authorName || 'Anonim',
    };

    this.postService.createPost(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Kaydedilirken bir hata oluştu.';
        this.isSaving = false;
      },
    });
  }
}
