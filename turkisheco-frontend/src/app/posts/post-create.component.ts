import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../services/post.service';
import { Post } from '../models/post';
import { AuthService } from '../services/auth.service';
import { WriterAuthService } from '../services/writer-auth.service';

@Component({
  selector: 'app-post-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss'],
})
export class PostCreateComponent {
  private readonly postService = inject(PostService);
  private readonly auth = inject(AuthService);
  private readonly writerAuth = inject(WriterAuthService);

  model: Partial<Post> = {
    title: '',
    slug: '',
    summary: '',
    coverImageUrl: '',
    category: '',
    tags: [],
    contentMarkdown: '',
  };
  tagsInput = '';
  posts: Post[] = [];
  selectedPostId: number | null = null;
  selectedStatusFilter = '';
  successMessage: string | null = null;
  isLoadingPosts = false;

  isSaving = false;
  error: string | null = null;

  get isAdmin(): boolean {
    return this.auth.isSuperAdmin();
  }

  get isWriter(): boolean {
    return !this.isAdmin && this.writerAuth.isLoggedIn();
  }

  get pageTitle(): string {
    return this.isAdmin ? 'Yönetici İçerik Stüdyosu' : 'Writer Editörü';
  }

  get pageDescription(): string {
    return this.isAdmin
      ? 'Taslak oluştur, yazıları düzenle ve istersen doğrudan yayımla.'
      : 'Kendi taslaklarını yönet, önizle ve incelemeye gönder.';
  }

  get statusOptions(): string[] {
    return ['', 'draft', 'submitted_for_review', 'approved', 'published', 'rejected'];
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  generateSlug() {
    if (!this.model.title) return;

    this.model.slug = this.model.title
      .toLowerCase()
      .trim()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  startNew(): void {
    this.selectedPostId = null;
    this.successMessage = null;
    this.error = null;
    this.tagsInput = '';
    this.model = {
      title: '',
      slug: '',
      summary: '',
      coverImageUrl: '',
      category: '',
      tags: [],
      contentMarkdown: '',
    };
  }

  selectPost(post: Post): void {
    this.selectedPostId = post.id;
    this.successMessage = null;
    this.error = null;
    this.model = {
      title: post.title,
      slug: post.slug,
      summary: post.summary ?? '',
      coverImageUrl: post.coverImageUrl ?? '',
      category: post.category ?? '',
      tags: post.tags ?? [],
      contentMarkdown: post.contentMarkdown,
      status: post.status,
    };
    this.tagsInput = (post.tags ?? []).join(', ');
  }

  saveDraft(): void {
    this.save('draft');
  }

  publishNow(): void {
    if (!this.isAdmin) {
      return;
    }

    this.save('published');
  }

  submitForReview(): void {
    if (!this.isWriter) {
      return;
    }

    if (this.selectedPostId) {
      this.isSaving = true;
      this.error = null;
      this.successMessage = null;

      this.postService.submitForReview(this.selectedPostId).subscribe({
        next: (post) => this.handleSuccess(post, 'Yazı incelemeye gönderildi.'),
        error: () => this.handleError('Yazı incelemeye gönderilemedi.'),
      });
      return;
    }

    this.save('draft', true);
  }

  deleteSelected(): void {
    if (!this.selectedPostId) {
      return;
    }

    const current = this.posts.find((post) => post.id === this.selectedPostId);
    if (!current) {
      return;
    }

    if (!confirm(`"${current.title}" içeriğini silmek istiyor musun?`)) {
      return;
    }

    this.isSaving = true;
    this.error = null;
    this.successMessage = null;

    this.postService.delete(current.id).subscribe({
      next: () => {
        this.isSaving = false;
        this.loadPosts();
        this.startNew();
        this.successMessage = 'Yazı silindi.';
      },
      error: () => this.handleError('Yazı silinemedi.'),
    });
  }

  onFilterChange(): void {
    this.loadPosts();
  }

  private save(targetStatus: string, submitAfterSave = false): void {
    this.error = null;
    this.successMessage = null;
    this.isSaving = true;

    if (!this.model.title || !this.model.contentMarkdown) {
      this.error = 'Başlık, slug ve içerik zorunludur.';
      this.isSaving = false;
      return;
    }

    if (!this.model.slug) {
      this.generateSlug();
    }

    const payload = {
      title: this.model.title.trim(),
      slug: (this.model.slug ?? '').trim(),
      summary: this.model.summary?.trim() || null,
      coverImageUrl: this.model.coverImageUrl?.trim() || null,
      category: this.model.category?.trim() || null,
      tags: this.previewTags(),
      contentMarkdown: this.model.contentMarkdown.trim(),
      status: targetStatus,
    };

    const request$ = this.selectedPostId
      ? this.postService.updatePost(this.selectedPostId, payload)
      : this.postService.createPost(payload);

    request$.subscribe({
      next: (post) => {
        if (submitAfterSave) {
          this.postService.submitForReview(post.id).subscribe({
            next: (submittedPost) =>
              this.handleSuccess(submittedPost, 'Yazı incelemeye gönderildi.'),
            error: () => this.handleError('Yazı kaydedildi ancak review isteği başarısız oldu.'),
          });
          return;
        }

        const message = targetStatus === 'published'
          ? 'Yazı yayımlandı.'
          : 'Taslak kaydedildi.';
        this.handleSuccess(post, message);
      },
      error: () => this.handleError('Kaydedilirken bir hata oluştu.'),
    });
  }

  private loadPosts(): void {
    this.isLoadingPosts = true;

    const request$ = this.isAdmin
      ? this.postService.getAdminAll(this.selectedStatusFilter || undefined)
      : this.postService.getMine(this.selectedStatusFilter || undefined);

    request$.subscribe({
      next: (posts) => {
        this.posts = posts;
        this.isLoadingPosts = false;
      },
      error: () => {
        this.error = 'Yazılar yüklenemedi.';
        this.isLoadingPosts = false;
      },
    });
  }

  previewTags(): string[] {
    return this.tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  private handleSuccess(post: Post, message: string): void {
    this.isSaving = false;
    this.successMessage = message;
    this.selectedPostId = post.id;
    this.selectPost(post);
    this.loadPosts();
  }

  private handleError(message: string): void {
    this.error = message;
    this.isSaving = false;
  }
}
