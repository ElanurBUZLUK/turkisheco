import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, CreateCommentRequest } from '../models/comment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private http = inject(HttpClient);
  private apiBase = 'http://localhost:5080/api';

  getForPost(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiBase}/posts/${postId}/comments`);
  }

  addComment(postId: number, payload: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.apiBase}/posts/${postId}/comments`,
      payload
    );
  }
}
