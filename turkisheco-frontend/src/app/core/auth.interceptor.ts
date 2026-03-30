import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { WriterAuthService } from '../services/writer-auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const writerAuth = inject(WriterAuthService);
  const router = inject(Router);
  const token = auth.getToken() ?? writerAuth.getToken();
  const apiOrigin = new URL(environment.apiBaseUrl).origin;

  if (token && req.url.startsWith(apiOrigin)) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          auth.logout();
          writerAuth.logout();
          router.navigate(['/account/login']);
        }
        return throwError(() => err);
      })
    );
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.logout();
        writerAuth.logout();
        router.navigate(['/account/login']);
      }
      return throwError(() => err);
    })
  );
};
