import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  // 1. Check if authenticated
  if (!user) {
    return router.createUrlTree(['/login']);
  }

  // 2. Check Role (defined in route data)
  const expectedRoles = route.data['roles'] as Array<string>;
  if (expectedRoles && !expectedRoles.includes(user.role)) {
    // Redirect to home if they don't have the right permissions
    return router.createUrlTree(['/unauthorized']);
  }

  return true;
};
