import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminAliasGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const requestedUserName = route.paramMap.get('username') ?? auth.getCurrentUser()?.userName ?? 'Ela';

  if (!auth.isSuperAdmin()) {
    return router.createUrlTree(['/ww', requestedUserName]);
  }

  const currentUser = auth.getCurrentUser();
  if (requestedUserName.toLowerCase() !== currentUser.userName.toLowerCase()) {
    return router.createUrlTree(['/ww', currentUser.userName, 'posts']);
  }

  return true;
};
