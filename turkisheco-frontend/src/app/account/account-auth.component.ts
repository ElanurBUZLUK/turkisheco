import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-account-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './account-auth.component.html',
  styleUrls: ['./account-auth.component.scss'],
})
export class AccountAuthComponent {
  form = {
    userName: '',
    displayName: '',
    email: '',
    password: '',
    acceptTerms: false,
  };
  isSubmitting = false;
  error: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.form.acceptTerms) {
      this.error = 'Lütfen kullanım koşullarını kabul edin.';
      return;
    }

    if (!this.form.userName || !this.form.email || !this.form.password) {
      this.error = 'Kullanıcı adı, e-posta ve şifre zorunludur.';
      return;
    }

    if (!this.isValidEmail(this.form.email)) {
      this.error = 'Geçerli bir e-posta adresi girin.';
      return;
    }

    if (!this.isStrongPassword(this.form.password)) {
      this.error = 'Şifre en az 8 karakter, bir harf ve bir rakam içermelidir.';
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    this.auth
      .register({
        userName: this.form.userName.trim(),
        email: this.form.email.trim(),
        password: this.form.password,
        displayName: this.form.displayName.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigateByUrl('/');
        },
        error: (err) => {
          console.error(err);
          this.error = 'Kayıt başarısız. Bilgileri kontrol edin.';
          this.isSubmitting = false;
        },
      });
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isStrongPassword(password: string): boolean {
    return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
  }
}
