// src/app/services/post.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post';
import { Comment, CreateCommentRequest } from '../models/comment';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private readonly apiUrl = `${environment.apiBaseUrl}/posts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl);
  }

  getMine(status?: string): Observable<Post[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.http.get<Post[]>(`${this.apiUrl}/mine${query}`);
  }

  getReviewQueue(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/review-queue`);
  }

  getAdminAll(status?: string): Observable<Post[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.http.get<Post[]>(`${this.apiUrl}/admin/all${query}`);
  }

  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }

  getBySlug(slug: string): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/slug/${slug}`);
  }

  getRelated(id: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/${id}/related`);
  }

  getComments(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${postId}/comments`);
  }

  addComment(
    postId: number,
    payload: CreateCommentRequest
  ): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${postId}/comments`, payload);
  }

  createPost(post: Partial<Post>): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, post);
  }

  updatePost(id: number, post: Partial<Post>): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, post);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  submitForReview(id: number): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/${id}/submit`, {});
  }

  approve(id: number, note?: string): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/${id}/approve`, { note });
  }

  reject(id: number, note?: string): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/${id}/reject`, { note });
  }

  publish(id: number, note?: string): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/${id}/publish`, { note });
  }
}
