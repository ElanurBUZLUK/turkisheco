import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile } from '../models/user-profile';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = 'http://localhost:5080/api/users';

  constructor(private http: HttpClient) {}

  getProfile(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/${id}`);
  }

  updateProfile(
    id: number,
    payload: { bio?: string | null; avatarUrl?: string | null }
  ): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }
}
