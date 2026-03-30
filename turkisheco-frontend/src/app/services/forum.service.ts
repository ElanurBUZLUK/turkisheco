import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ForumThread,
  CreateForumThreadRequest,
} from '../models/forum.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ForumService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/forum`;

  getThreads(): Observable<ForumThread[]> {
    return this.http.get<ForumThread[]>(`${this.baseUrl}/threads`);
  }

  createThread(payload: CreateForumThreadRequest): Observable<ForumThread> {
    return this.http.post<ForumThread>(`${this.baseUrl}/threads`, payload);
  }
}
