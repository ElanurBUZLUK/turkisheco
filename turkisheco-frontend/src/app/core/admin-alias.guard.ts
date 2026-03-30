import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminAliasGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isSuperAdmin()) {
    return router.createUrlTree(['/admin/login']);
  }

  const requestedUserName = route.paramMap.get('username');
  const currentUser = auth.getCurrentUser();

  if (!requestedUserName || !currentUser) {
    return router.createUrlTree(['/admin/login']);
  }

  if (requestedUserName.toLowerCase() !== currentUser.userName.toLowerCase()) {
    return router.createUrlTree([auth.getAdminRoute()]);
  }

  return true;
};
