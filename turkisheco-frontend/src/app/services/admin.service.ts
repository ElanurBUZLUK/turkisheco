import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminWriter {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly writersUrl = `${environment.apiBaseUrl}/admin/writers`;

  constructor(private http: HttpClient) {}

  listWriters(): Observable<AdminWriter[]> {
    return this.http.get<AdminWriter[]>(this.writersUrl);
  }

  createWriter(payload: { username: string; email: string }): Observable<AdminWriter> {
    return this.http.post<AdminWriter>(this.writersUrl, payload);
  }
}
