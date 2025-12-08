import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  ForumThread,
  ForumUser,
  CreateForumUserRequest,
  CreateForumThreadRequest,
} from '../models/forum.models';
import { ForumService } from '../services/forum.service';

@Component({
  selector: 'app-forum-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forum-home.component.html',
  styleUrl: './forum-home.component.scss',
})
export class ForumHomeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private forumService = inject(ForumService);

  userForm: FormGroup;
  threadForm: FormGroup;

  currentUser: ForumUser | null = null;

  threads: ForumThread[] = [];
  isLoadingThreads = false;
  isCreatingUser = false;
  isCreatingThread = false;
  error: string | null = null;

  constructor() {
    this.userForm = this.fb.group({
      userName: [
        '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(20)],
      ],
      bio: [''],
    });

    this.threadForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  ngOnInit(): void {
    this.loadThreads();
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
        this.error = 'Forum başlıkları yüklenirken bir hata oluştu.';
        this.isLoadingThreads = false;
      },
    });
  }

  createUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isCreatingUser = true;

    const payload: CreateForumUserRequest = this.userForm.value;

    this.forumService.createUser(payload).subscribe({
      next: (user) => {
        this.currentUser = user;
        this.isCreatingUser = false;
      },
      error: () => {
        this.error = 'Profil oluşturulurken bir hata oluştu.';
        this.isCreatingUser = false;
      },
    });
  }

  createThread(): void {
    if (!this.currentUser) {
      this.error = 'Önce kullanıcı adınla bir profil oluşturmalısın.';
      return;
    }

    if (this.threadForm.invalid) {
      this.threadForm.markAllAsTouched();
      return;
    }

    this.isCreatingThread = true;

    const payload: CreateForumThreadRequest = {
      ...this.threadForm.value,
      forumUserId: this.currentUser.id,
    };

    this.forumService.createThread(payload).subscribe({
      next: (thread) => {
        this.threadForm.reset();
        this.threads = [thread, ...this.threads];
        this.isCreatingThread = false;
      },
      error: () => {
        this.error = 'Sohbet başlığı oluşturulurken bir hata oluştu.';
        this.isCreatingThread = false;
      },
    });
  }
}
