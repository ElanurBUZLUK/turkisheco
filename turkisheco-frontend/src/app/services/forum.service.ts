import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ForumUser,
  ForumThread,
  CreateForumUserRequest,
  CreateForumThreadRequest,
} from '../models/forum.models';

@Injectable({ providedIn: 'root' })
export class ForumService {
  private http = inject(HttpClient);

  // İstersen bunu environment’a taşıyabilirsin
  private readonly baseUrl = 'http://localhost:5080/api/forum';

  getThreads(): Observable<ForumThread[]> {
    return this.http.get<ForumThread[]>(`${this.baseUrl}/threads`);
  }

  createUser(payload: CreateForumUserRequest): Observable<ForumUser> {
    return this.http.post<ForumUser>(`${this.baseUrl}/users`, payload);
  }

  createThread(payload: CreateForumThreadRequest): Observable<ForumThread> {
    return this.http.post<ForumThread>(`${this.baseUrl}/threads`, payload);
  }
}
