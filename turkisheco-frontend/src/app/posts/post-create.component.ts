import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../services/post.service';
import { Post } from '../models/post';

@Component({
  selector: 'app-post-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss'],
})
export class PostCreateComponent {
  model: Partial<Post> = {
    title: '',
    slug: '',
    contentMarkdown: '',
    authorName: 'Ela', // şimdilik sabit, sonra login olan kullanıcıdan alırız
  };

  isSaving = false;
  error: string | null = null;

  constructor(
    private postService: PostService,
    private router: Router
  ) {}

  generateSlug() {
    if (!this.model.title) return;

    this.model.slug = this.model.title
      .toLowerCase()
      .trim()
      // Türkçe karakterleri de kapsayacak şekilde kaba bir slug üretimi
      .replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  save() {
    this.error = null;
    this.isSaving = true;

    if (!this.model.title || !this.model.slug || !this.model.contentMarkdown) {
      this.error = 'Başlık, slug ve içerik zorunludur.';
      this.isSaving = false;
      return;
    }

    const payload = {
      title: this.model.title,
      slug: this.model.slug,
      contentMarkdown: this.model.contentMarkdown,
      authorName: this.model.authorName || 'Anonim',
    };

    this.postService.createPost(payload).subscribe({
      next: () => {
        this.isSaving = false;
        // başarılı olursa admin listesine dön
        this.router.navigate(['/admin/posts']);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Kaydedilirken bir hata oluştu.';
        this.isSaving = false;
      },
    });
  }
}
