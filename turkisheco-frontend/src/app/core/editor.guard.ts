import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { WriterAuthService } from '../services/writer-auth.service';

export const editorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const writerAuth = inject(WriterAuthService);
  const router = inject(Router);

  if (auth.isSuperAdmin() || writerAuth.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/account/login']);
};
