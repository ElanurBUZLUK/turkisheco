import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const currentUser = auth.getCurrentUser();
  const requestedUserName = route.paramMap.get('username') ?? currentUser?.userName ?? 'Ela';

  if (auth.isSuperAdmin() && currentUser) {
    if (requestedUserName.toLowerCase() !== currentUser.userName.toLowerCase()) {
      return router.createUrlTree(['/ww', currentUser.userName, 'posts']);
    }

    return true;
  }

  return router.createUrlTree(['/ww', requestedUserName]);
};
