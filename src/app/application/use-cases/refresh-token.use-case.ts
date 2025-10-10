import { Observable } from 'rxjs';
import { User } from '../../domain/models/user.model';
import { IAuthRepository } from '../../domain/ports/auth-repository.port';
import { IStoragePort } from '../../domain/ports/storage.port';
import { tap } from 'rxjs/operators';

/**
 * Caso de Uso: Refrescar token de autenticación
 */
export class RefreshTokenUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private storage: IStoragePort
  ) {}

  execute(): Observable<User> {
    const refreshToken = this.storage.get('refresh_token'); // ← Clave correcta

    if (!refreshToken) {
      throw new Error('No hay refresh token disponible');
    }

    return this.authRepository.refreshToken(refreshToken).pipe(
      tap(user => {
        // Actualizar tokens en el storage (compatibilidad con AuthService)
        this.storage.set('auth_token', user.token);
        this.storage.set('refresh_token', user.refreshToken);
        this.storage.set('expiresIn', user.expiresIn.toString());

        // Actualizar timestamp de expiración
        const expiresAt = Date.now() + user.expiresIn;
        this.storage.set('token_expiration', expiresAt.toString());
      })
    );
  }

  /**
   * Verifica si el token debe ser refrescado (< 5 minutos para expirar)
   */
  shouldRefreshToken(): boolean {
    const expiresAtStr = this.storage.get('token_expiration'); // ← Clave correcta
    if (!expiresAtStr) {
      return false;
    }

    const expiresAt = parseInt(expiresAtStr);
    const now = Date.now();
    const timeLeft = expiresAt - now;
    const fiveMinutes = 5 * 60 * 1000;

    return timeLeft < fiveMinutes && timeLeft > 0;
  }
}
