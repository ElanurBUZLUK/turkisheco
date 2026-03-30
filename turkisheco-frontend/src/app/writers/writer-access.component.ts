import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WriterAuthService } from '../services/writer-auth.service';

@Component({
  selector: 'app-writer-access',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './writer-access.component.html',
  styleUrl: './writer-access.component.scss',
})
export class WriterAccessComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly writerAuth = inject(WriterAuthService);
  private resendTimerId: ReturnType<typeof setInterval> | null = null;

  username = '';
  writerExists = true;
  writerActive = true;
  codeSent = false;
  isChecking = true;
  isSendingCode = false;
  isVerifyingCode = false;
  resendCountdown = 0;
  error: string | null = null;
  info: string | null = null;
  debugCode: string | null = null;

  codeForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(8)]],
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.username = (params.get('username') ?? '').trim().toLowerCase();
      this.resetState();
      this.loadWriterStatus();
    });
  }

  ngOnDestroy(): void {
    this.clearResendTimer();
  }

  requestCode(): void {
    if (!this.username || !this.writerExists || !this.writerActive) {
      return;
    }

    this.error = null;
    this.info = null;
    this.debugCode = null;
    this.isSendingCode = true;

    this.writerAuth.requestCode(this.username).subscribe({
      next: (response) => {
        this.codeSent = true;
        this.isSendingCode = false;
        this.info = 'Giriş kodu kayıtlı e-posta adresine gönderildi.';
        this.debugCode = response.debugCode ?? null;
        this.startResendCountdown(response.retryAfterSeconds);
      },
      error: (err) => {
        this.isSendingCode = false;
        this.error = err?.error?.title || err?.error || 'Kod gönderilemedi.';
      },
    });
  }

  verifyCode(): void {
    if (this.codeForm.invalid || !this.username) {
      this.codeForm.markAllAsTouched();
      return;
    }

    const code = this.codeForm.get('code')?.value?.trim() ?? '';
    this.error = null;
    this.info = null;
    this.isVerifyingCode = true;

    this.writerAuth.verifyCode(this.username, code).subscribe({
      next: () => {
        this.isVerifyingCode = false;
        this.router.navigate(['/posts/new']);
      },
      error: (err) => {
        this.isVerifyingCode = false;
        this.error = err?.error?.title || err?.error || 'Kod doğrulanamadı.';
      },
    });
  }

  private loadWriterStatus(): void {
    if (!this.username) {
      this.isChecking = false;
      this.writerExists = false;
      this.error = 'Geçersiz writer adresi.';
      return;
    }

    this.isChecking = true;
    this.writerAuth.getStatus(this.username).subscribe({
      next: (status) => {
        this.writerExists = status.exists;
        this.writerActive = status.isActive;
        this.isChecking = false;

        if (!status.exists) {
          this.error = 'Bu kullanıcı adına bağlı bir writer hesabı bulunamadı.';
        } else if (!status.isActive) {
          this.error = 'Bu writer hesabı pasif durumda.';
        }
      },
      error: () => {
        this.writerExists = false;
        this.writerActive = false;
        this.isChecking = false;
        this.error = 'Writer hesabı doğrulanamadı.';
      },
    });
  }

  private resetState(): void {
    this.clearResendTimer();
    this.codeForm.reset();
    this.writerExists = true;
    this.writerActive = true;
    this.codeSent = false;
    this.isChecking = true;
    this.isSendingCode = false;
    this.isVerifyingCode = false;
    this.resendCountdown = 0;
    this.error = null;
    this.info = null;
    this.debugCode = null;
  }

  private startResendCountdown(seconds: number): void {
    this.clearResendTimer();
    this.resendCountdown = Math.max(seconds, 0);

    if (this.resendCountdown === 0) {
      return;
    }

    this.resendTimerId = setInterval(() => {
      this.resendCountdown -= 1;
      if (this.resendCountdown <= 0) {
        this.clearResendTimer();
      }
    }, 1000);
  }

  private clearResendTimer(): void {
    if (this.resendTimerId) {
      clearInterval(this.resendTimerId);
      this.resendTimerId = null;
    }
  }
}
