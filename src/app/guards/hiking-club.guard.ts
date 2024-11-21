import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const hikingClubGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.userType$.pipe(
    take(1),
    map(userType => {
      if (userType === 'hikingClub') {
        return true;
      } else {
        router.navigate(['/']);
        return false;
      }
    })
  );
};
