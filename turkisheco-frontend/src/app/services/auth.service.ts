import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

const API_BASE = 'http://localhost:5080/api';

export interface AuthResponse {
  token: string;
  forumUserId: number;
  userName: string;
  displayName: string;
}

export interface LoggedInUser {
  forumUserId: number;
  userName: string;
  displayName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'turkisheco_token';
  private readonly USER_KEY = 'turkisheco_user';

  private currentUserSubject = new BehaviorSubject<LoggedInUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage() {
    const token = this.getToken();
    const storedUser = localStorage.getItem(this.USER_KEY);

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
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  register(payload: { userName: string; email: string; password: string; displayName?: string }) {
    return this.http
      .post<AuthResponse>(`${API_BASE}/auth/register`, payload)
      .pipe(tap((res) => this.persistAuth(res)));
  }

  login(payload: { userNameOrEmail: string; password: string }) {
    return this.http
      .post<AuthResponse>(`${API_BASE}/auth/login`, payload)
      .pipe(tap((res) => this.persistAuth(res)));
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  private persistAuth(res: AuthResponse) {
    if (!res?.token) return;

    localStorage.setItem(this.TOKEN_KEY, res.token);

    const user: LoggedInUser = {
      forumUserId: res.forumUserId,
      userName: res.userName,
      displayName: res.displayName,
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
