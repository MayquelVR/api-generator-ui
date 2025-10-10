import { Observable, throwError } from 'rxjs';
import { User } from '../../domain/models/user.model';
import { IAuthRepository } from '../../domain/ports/auth-repository.port';
import { IStoragePort } from '../../domain/ports/storage.port';
import { tap, catchError } from 'rxjs/operators';

/**
 * Caso de Uso: Autenticar usuario
 */
export class LoginUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private storage: IStoragePort
  ) {}

  execute(username: string, password: string): Observable<User> {
    if (!username || username.trim() === '') {
      return throwError(() => new Error('El nombre de usuario es requerido'));
    }

    if (!password || password.trim() === '') {
      return throwError(() => new Error('La contraseña es requerida'));
    }

    return this.authRepository.login(username, password).pipe(
      tap(user => {
        // Validar que el usuario tiene los datos necesarios
        if (!user || !user.token || !user.refreshToken) {
          throw new Error('Respuesta inválida del servidor');
        }

        // Almacenar tokens en el storage (compatibilidad con AuthService)
        this.storage.set('auth_token', user.token);
        this.storage.set('refresh_token', user.refreshToken);
        this.storage.set('expiresIn', user.expiresIn.toString());

        // Calcular y almacenar timestamp de expiración
        const expiresAt = Date.now() + user.expiresIn;
        this.storage.set('token_expiration', expiresAt.toString());
      }),
      catchError(error => {
        // Propagar el error para que el componente lo maneje
        return throwError(() => error);
      })
    );
  }
}
