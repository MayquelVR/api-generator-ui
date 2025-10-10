import { Observable } from 'rxjs';
import { IAuthRepository } from '../../domain/ports/auth-repository.port';

/**
 * Caso de Uso: Solicitar recuperación de contraseña
 */
export class ForgotPasswordUseCase {
  constructor(private authRepository: IAuthRepository) {}

  execute(email: string): Observable<void> {
    if (!email || email.trim() === '') {
      throw new Error('El email es requerido');
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('El formato del email es inválido');
    }

    return this.authRepository.forgotPassword(email);
  }
}
