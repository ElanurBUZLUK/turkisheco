import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WriterAccessStatus {
  username: string;
  exists: boolean;
  isActive: boolean;
}

export interface RequestWriterCodeResponse {
  success: boolean;
  expiresInSeconds: number;
  retryAfterSeconds: number;
  debugCode?: string | null;
}

export interface WriterAuthResponse {
  token: string;
  writerId: number;
  username: string;
  email: string;
}

export interface LoggedInWriter {
  writerId: number;
  username: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class WriterAuthService {
  private readonly TOKEN_KEY = 'turkisheco_writer_token';
  private readonly WRITER_KEY = 'turkisheco_writer_user';
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly platformId = inject(PLATFORM_ID);

  private currentWriterSubject = new BehaviorSubject<LoggedInWriter | null>(null);
  currentWriter$ = this.currentWriterSubject.asObservable();

  constructor(private http: HttpClient) {
    this.hydrateFromStorage();
  }

  getStatus(username: string) {
    return this.http.get<WriterAccessStatus>(`${this.apiBaseUrl}/writer-access/${username}`);
  }

  requestCode(username: string) {
    return this.http.post<RequestWriterCodeResponse>(
      `${this.apiBaseUrl}/writer-access/request-code`,
      { username }
    );
  }

  verifyCode(username: string, code: string) {
    return this.http
      .post<WriterAuthResponse>(`${this.apiBaseUrl}/writer-access/verify-code`, { username, code })
      .pipe(tap((response) => this.persistAuth(response)));
  }

  getToken(): string | null {
    return this.getStorageItem(this.TOKEN_KEY);
  }

  getCurrentWriter(): LoggedInWriter | null {
    return this.currentWriterSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.removeStorageItem(this.TOKEN_KEY);
    this.removeStorageItem(this.WRITER_KEY);
    this.currentWriterSubject.next(null);
  }

  private hydrateFromStorage(): void {
    const token = this.getToken();
    const storedWriter = this.getStorageItem(this.WRITER_KEY);

    if (!token || !storedWriter) {
      this.currentWriterSubject.next(null);
      return;
    }

    try {
      this.currentWriterSubject.next(JSON.parse(storedWriter));
    } catch {
      this.logout();
    }
  }

  private persistAuth(response: WriterAuthResponse): void {
    if (!response?.token || !isPlatformBrowser(this.platformId)) {
      return;
    }

    const writer: LoggedInWriter = {
      writerId: response.writerId,
      username: response.username,
      email: response.email,
    };

    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.WRITER_KEY, JSON.stringify(writer));
    this.currentWriterSubject.next(writer);
  }

  private getStorageItem(key: string): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return localStorage.getItem(key);
  }

  private removeStorageItem(key: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.removeItem(key);
  }
}
