import { Injectable, OnDestroy, Inject } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import { IAuthRepository } from '../domain/ports/auth-repository.port';
import { IStoragePort } from '../domain/ports/storage.port';
import { AUTH_REPOSITORY, STORAGE_PORT } from '../app.config';
import { Router } from '@angular/router';

/**
 * Servicio para refrescar automáticamente el token de autenticación
 * Usa arquitectura hexagonal con Use Cases
 */
@Injectable({
  providedIn: 'root'
})
export class TokenRefreshService implements OnDestroy {
  private refreshSubscription?: Subscription;
  private refreshTokenUseCase: RefreshTokenUseCase;

  constructor(
    @Inject(AUTH_REPOSITORY) private authRepository: IAuthRepository,
    @Inject(STORAGE_PORT) private storage: IStoragePort,
    private router: Router
  ) {
    this.refreshTokenUseCase = new RefreshTokenUseCase(this.authRepository, this.storage);
  }

  startTokenRefresh(): void {
    if (this.refreshSubscription) {
      return;
    }

    // Verificar cada 1 minuto si el token necesita refrescarse
    this.refreshSubscription = interval(60000).subscribe(() => {
      if (this.isAuthenticated() && this.refreshTokenUseCase.shouldRefreshToken()) {
        this.refreshTokenUseCase.execute().subscribe({
          next: () => {
            // Token refrescado exitosamente
          },
          error: () => {
            // Error al refrescar token - redirigir a login
            this.stopTokenRefresh();
            this.router.navigate(['/login']);
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

  private isAuthenticated(): boolean {
    const token = this.storage.get('auth_token');
    return token !== null && token.trim() !== '';
  }

  ngOnDestroy(): void {
    this.stopTokenRefresh();
  }
}
