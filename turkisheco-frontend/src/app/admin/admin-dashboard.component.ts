import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService, AdminWriter } from '../services/admin.service';
import { PostService } from '../services/post.service';
import { Post } from '../models/post';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly postService = inject(PostService);

  readonly reservedUsernames = ['admin', 'about', 'contact', 'posts', 'forum', 'login', 'register', 'account', 'api', 'w'];

  writerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
  });

  writers: AdminWriter[] = [];
  reviewPosts: Post[] = [];
  selectedPost: Post | null = null;
  reviewNote = '';
  isSavingWriter = false;
  isLoading = false;
  writerError: string | null = null;
  queueError: string | null = null;

  ngOnInit(): void {
    this.loadDashboard();
  }

  createWriter(): void {
    if (this.writerForm.invalid) {
      this.writerForm.markAllAsTouched();
      return;
    }

    const username = this.writerForm.value.username?.trim().toLowerCase() ?? '';
    if (this.reservedUsernames.includes(username)) {
      this.writerError = 'Bu kullanıcı adı sistem route\'ları için ayrılmış durumda.';
      return;
    }

    this.isSavingWriter = true;
    this.writerError = null;

    this.adminService.createWriter({
      username,
      email: this.writerForm.value.email?.trim() ?? '',
    }).subscribe({
      next: (writer) => {
        this.writers = [writer, ...this.writers];
        this.writerForm.reset();
        this.writerForm.patchValue({ username: '', email: '' });
        this.isSavingWriter = false;
      },
      error: (err) => {
        this.writerError = err?.error || 'Yazar oluşturulamadı.';
        this.isSavingWriter = false;
      },
    });
  }

  selectPost(post: Post): void {
    this.selectedPost = post;
    this.reviewNote = post.reviewNote ?? post.rejectionReason ?? '';
  }

  approveSelected(): void {
    if (!this.selectedPost) return;

    this.postService.approve(this.selectedPost.id, this.reviewNote).subscribe({
      next: (post) => this.updatePost(post),
      error: () => this.queueError = 'Onay işlemi başarısız oldu.',
    });
  }

  rejectSelected(): void {
    if (!this.selectedPost) return;

    this.postService.reject(this.selectedPost.id, this.reviewNote).subscribe({
      next: (post) => this.updatePost(post),
      error: () => this.queueError = 'Red işlemi başarısız oldu.',
    });
  }

  publishSelected(): void {
    if (!this.selectedPost) return;

    this.postService.publish(this.selectedPost.id, this.reviewNote).subscribe({
      next: (post) => this.updatePost(post),
      error: () => this.queueError = 'Yayınlama işlemi başarısız oldu.',
    });
  }

  private loadDashboard(): void {
    this.isLoading = true;
    this.writerError = null;
    this.queueError = null;

    this.adminService.listWriters().subscribe({
      next: (writers) => this.writers = writers,
      error: () => this.writerError = 'Yazar listesi yüklenemedi.',
    });

    this.postService.getReviewQueue().subscribe({
      next: (posts) => {
        this.reviewPosts = posts;
        this.selectedPost = posts[0] ?? null;
        this.reviewNote = this.selectedPost?.reviewNote ?? '';
        this.isLoading = false;
      },
      error: () => {
        this.queueError = 'Onay bekleyen yazılar yüklenemedi.';
        this.isLoading = false;
      },
    });
  }

  private updatePost(updatedPost: Post): void {
    this.reviewPosts = this.reviewPosts
      .map((post) => post.id === updatedPost.id ? updatedPost : post)
      .filter((post) => post.status === 'submitted_for_review' || post.status === 'approved');
    this.selectedPost = this.reviewPosts.find((post) => post.id === updatedPost.id) ?? this.reviewPosts[0] ?? null;
    this.reviewNote = this.selectedPost?.reviewNote ?? this.selectedPost?.rejectionReason ?? '';
  }
}
