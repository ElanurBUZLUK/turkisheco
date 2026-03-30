import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  token: string;
  forumUserId: number;
  userName: string;
  displayName: string;
  role: string;
}

export interface LoggedInUser {
  forumUserId: number;
  userName: string;
  displayName: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'turkisheco_token';
  private readonly USER_KEY = 'turkisheco_user';
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly platformId = inject(PLATFORM_ID);

  private currentUserSubject = new BehaviorSubject<LoggedInUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage() {
    const token = this.getToken();
    const storedUser = this.getStorageItem(this.USER_KEY);

    if (!token) {
      this.currentUserSubject.next(null);
      return;
    }

    if (storedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(storedUser));
        return;
      } catch {
        // ignore parse errors and reset
      }
    }

    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return this.getStorageItem(this.TOKEN_KEY);
  }

  getCurrentUser(): LoggedInUser | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isSuperAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'super_admin';
  }

  getAdminRoute(): string {
    const adminUserName = this.currentUserSubject.value?.userName ?? 'Ela';
    return `/ww/${adminUserName}`;
  }

  register(payload: { userName: string; email: string; password: string; displayName?: string }) {
    return this.http
      .post<AuthResponse>(`${this.apiBaseUrl}/auth/register`, payload)
      .pipe(tap((res) => this.persistAuth(res)));
  }

  login(payload: { userNameOrEmail: string; password: string }) {
    return this.http
      .post<AuthResponse>(`${this.apiBaseUrl}/auth/login`, payload)
      .pipe(tap((res) => this.persistAuth(res)));
  }

  logout() {
    this.removeStorageItem(this.TOKEN_KEY);
    this.removeStorageItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  private persistAuth(res: AuthResponse) {
    if (!res?.token || !isPlatformBrowser(this.platformId)) return;

    localStorage.setItem(this.TOKEN_KEY, res.token);

    const user: LoggedInUser = {
      forumUserId: res.forumUserId,
      userName: res.userName,
      displayName: res.displayName,
      role: res.role,
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
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
