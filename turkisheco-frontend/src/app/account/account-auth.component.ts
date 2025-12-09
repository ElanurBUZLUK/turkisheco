import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-account-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './account-auth.component.html',
  styleUrls: ['./account-auth.component.scss'],
})
export class AccountAuthComponent {
  form = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    acceptTerms: false,
  };

  onSubmit(): void {
    if (!this.form.acceptTerms) {
      alert('Lütfen kullanım koşullarını kabul edin.');
      return;
    }

    if (!this.form.password || this.form.password.length < 8) {
      alert('Şifre en az 8 karakter olmalıdır!');
      return;
    }

    alert(`Hoş geldiniz ${this.form.firstName || 'kullanıcı'}! Hesabınız başarıyla oluşturuldu.`);
  }
}
