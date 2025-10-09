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

    console.log('🚀 Token refresh service started');

    // Verificar cada 1 minuto
    this.refreshSubscription = interval(60000).subscribe(() => {
      if (this.authService.isAuthenticated() && this.authService.shouldRefreshToken()) {
        console.log('🔄 Auto-refreshing token (background check)...');

        this.authService.refreshToken().subscribe({
          next: (response) => {
            console.log('✅ Token auto-refreshed successfully');
          },
          error: (err) => {
            console.error('❌ Failed to auto-refresh token:', err);
          }
        });
      }
    });
  }

  stopTokenRefresh(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = undefined;
      console.log('🛑 Token refresh service stopped');
    }
  }

  ngOnDestroy(): void {
    this.stopTokenRefresh();
  }
}
