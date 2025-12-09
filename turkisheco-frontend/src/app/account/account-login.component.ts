import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-account-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './account-login.component.html',
  styleUrls: ['./account-login.component.scss'],
})
export class AccountLoginComponent {
  form = {
    email: '',
    password: '',
    remember: false,
  };

  onSubmit(): void {
    if (!this.form.email || !this.form.password) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    alert('Hoş geldiniz! Giriş başarılı.');
  }
}
