import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const rootGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // If authenticated, redirect to collections
    router.navigate(['/collections']);
    return false;
  } else {
    // If not authenticated, redirect to login
    router.navigate(['/login']);
    return false;
  }
};
