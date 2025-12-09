import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

interface UserProfile {
  id: number;
  userName: string;
  email?: string | null;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
}

@Component({
  selector: 'app-account-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.scss'],
})
export class AccountProfileComponent {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  form: FormGroup = this.fb.group({
    displayName: ['', [Validators.required, Validators.maxLength(100)]],
    bio: ['', [Validators.maxLength(1000)]],
    avatarUrl: [''],
  });

  isLoading = true;
  isSaving = false;
  error: string | null = null;
  profile: UserProfile | null = null;

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.isLoading = false;
      this.error = 'Profil bilgilerini görmek için lütfen giriş yapın.';
      return;
    }

    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.error = null;

    this.http
      .get<UserProfile>('http://localhost:5080/api/profile/me')
      .subscribe({
        next: (profile) => {
          this.profile = profile;
          this.form.patchValue({
            displayName: profile.displayName ?? profile.userName ?? '',
            bio: profile.bio ?? '',
            avatarUrl: profile.avatarUrl ?? '',
          });
          this.isLoading = false;
        },
        error: () => {
          this.error = 'Profil bilgileri yüklenirken bir hata oluştu. Oturumunuzun açık olduğundan emin olun.';
          this.isLoading = false;
        },
      });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.error = null;

    this.http
      .put<UserProfile>('http://localhost:5080/api/profile/me', this.form.value)
      .subscribe({
        next: (profile) => {
          this.profile = profile;
          this.isSaving = false;
        },
        error: () => {
          this.error = 'Profil kaydedilirken bir hata oluştu.';
          this.isSaving = false;
        },
      });
  }
}
