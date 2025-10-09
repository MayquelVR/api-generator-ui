import { Injectable, OnDestroy } from '@angular/core';
import { AuthService } from './auth.service';
import { interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenRefreshService implements OnDestroy {
  private refreshSubscription?: Subscription;

  constructor(private authService: AuthService) {}

  startTokenRefresh(): void {
    if (this.refreshSubscription) {
      return;
    }

    // Verificar cada 1 minuto
    this.refreshSubscription = interval(60000).subscribe(() => {
      if (this.authService.isAuthenticated() && this.authService.shouldRefreshToken()) {

        this.authService.refreshToken().subscribe({
          next: (response) => {
          },
          error: (err) => {
          }
        });
      }
    });
  }

  stopTokenRefresh(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = undefined;
    }
  }

  ngOnDestroy(): void {
    this.stopTokenRefresh();
  }
}
