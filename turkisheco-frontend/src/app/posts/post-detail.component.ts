import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostService } from '../services/post.service';
import { CommentService } from '../services/comment.service';
import { Post } from '../models/post';
import { Comment } from '../models/comment';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
})
export class PostDetailComponent {
  private route = inject(ActivatedRoute);
  private postService = inject(PostService);
  private commentService = inject(CommentService);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  post?: Post;
  comments: Comment[] = [];
  recommended: Post[] = [];

  isLoadingPost = true;
  isLoadingComments = true;
  isSubmitting = false;
  loadError: string | null = null;
  isLoggedIn = false;

  commentForm: FormGroup = this.fb.group({
    authorName: ['', [Validators.required, Validators.maxLength(80)]],
    authorEmail: ['', [Validators.email]],
    content: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.auth.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
      this.toggleNameValidator(this.isLoggedIn);
    });
    this.toggleNameValidator(this.isLoggedIn);

    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.loadError = 'Geçersiz yazı adresi.';
      this.isLoadingPost = false;
      this.isLoadingComments = false;
      return;
    }

    this.loadPost(slug);
  }

  private loadPost(slug: string) {
    this.isLoadingPost = true;
    this.loadError = null;

    this.postService.getBySlug(slug).subscribe({
      next: (post) => {
        this.post = post;
        this.isLoadingPost = false;

        this.loadComments(post.id);
        this.loadRecommended(post.id);
      },
      error: () => {
        this.loadError = 'Yazı yüklenirken bir sorun oluştu.';
        this.isLoadingPost = false;
        this.isLoadingComments = false;
      },
    });
  }

  private loadComments(postId: number) {
    this.isLoadingComments = true;

    this.commentService.getForPost(postId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.isLoadingComments = false;
      },
      error: () => {
        this.comments = [];
        this.isLoadingComments = false;
      },
    });
  }

  private loadRecommended(currentPostId: number) {
    this.postService.getAll().subscribe({
      next: (posts) => {
        this.recommended = posts
          .filter((p) => p.id !== currentPostId)
          .slice(0, 5);
      },
      error: () => {
        this.recommended = [];
      },
    });
  }

  submitComment(): void {
    if (!this.post) {
      return;
    }

    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.commentService
      .addComment(this.post.id, this.commentForm.value)
      .subscribe({
        next: (created) => {
          this.comments = [created, ...this.comments];
          this.commentForm.reset();
          this.isSubmitting = false;
        },
        error: () => {
          this.isSubmitting = false;
        },
      });
  }

  private toggleNameValidator(loggedIn: boolean) {
    const nameControl = this.commentForm.get('authorName');
    if (!nameControl) return;

    if (loggedIn) {
      nameControl.clearValidators();
    } else {
      nameControl.setValidators([Validators.required, Validators.maxLength(80)]);
    }
    nameControl.updateValueAndValidity();
  }
}
