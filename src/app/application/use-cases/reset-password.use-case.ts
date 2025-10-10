import { Observable } from 'rxjs';
import { IAuthRepository } from '../../domain/ports/auth-repository.port';

/**
 * Caso de Uso: Restablecer contraseña con token
 */
export class ResetPasswordUseCase {
  constructor(private authRepository: IAuthRepository) {}

  execute(token: string, password: string): Observable<void> {
    if (!token || token.trim() === '') {
      throw new Error('El token de recuperación es requerido');
    }

    if (!password || password.trim() === '') {
      throw new Error('La contraseña es requerida');
    }

    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    return this.authRepository.resetPassword(token, password);
  }
}
