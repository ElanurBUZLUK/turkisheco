import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ForumThread, CreateForumThreadRequest } from '../models/forum.models';
import { ForumService } from '../services/forum.service';
import { AuthService, LoggedInUser } from '../services/auth.service';

@Component({
  selector: 'app-forum-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forum-home.component.html',
  styleUrls: ['./forum-home.component.scss'],
})
export class ForumHomeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private forumService = inject(ForumService);
  private auth = inject(AuthService);
  threadForm: FormGroup;

  currentUser: LoggedInUser | null = null;

  threads: ForumThread[] = [];
  isLoadingThreads = false;
  isCreatingThread = false;
  error: string | null = null;

  constructor() {
    this.threadForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  ngOnInit(): void {
    this.loadThreads();
    this.auth.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  createThread(): void {
    if (!this.currentUser) {
      this.error = 'Başlık açmak için önce giriş yapmalısın.';
      return;
    }

    if (this.threadForm.invalid) {
      this.threadForm.markAllAsTouched();
      return;
    }

    this.isCreatingThread = true;

    const payload: CreateForumThreadRequest = {
      ...this.threadForm.value,
    };

    this.forumService.createThread(payload).subscribe({
      next: (thread) => {
        this.threadForm.reset();
        this.threads = [thread, ...this.threads];
        this.isCreatingThread = false;
      },
      error: () => {
        this.error = 'Sohbet başlığı oluşturulurken bir hata oluştu. Oturumunun açık olduğundan emin ol.';
        this.isCreatingThread = false;
      },
    });
  }

  loadThreads(): void {
    this.isLoadingThreads = true;
    this.error = null;

    this.forumService.getThreads().subscribe({
      next: (threads) => {
        this.threads = threads;
        this.isLoadingThreads = false;
      },
      error: () => {
        this.error = 'Topluluk başlıkları yüklenirken bir hata oluştu.';
        this.isLoadingThreads = false;
      },
    });
  }
}
