import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-account-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './account-login.component.html',
  styleUrls: ['./account-login.component.scss'],
})
export class AccountLoginComponent {
  form = {
    userNameOrEmail: '',
    password: '',
    remember: false,
  };
  isSubmitting = false;
  error: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.form.userNameOrEmail || !this.form.password) {
      this.error = 'Lütfen tüm alanları doldurun!';
      return;
    }

    if (this.form.password.length < 8) {
      this.error = 'Şifre en az 8 karakter olmalıdır.';
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    this.auth
      .login({
        userNameOrEmail: this.form.userNameOrEmail.trim(),
        password: this.form.password,
      })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigateByUrl('/');
        },
        error: (err) => {
          console.error(err);
          this.error = 'Giriş başarısız. Bilgileri kontrol edin.';
          this.isSubmitting = false;
        },
      });
  }
}
