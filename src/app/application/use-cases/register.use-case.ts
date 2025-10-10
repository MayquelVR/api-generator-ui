import { Observable } from 'rxjs';
import { IAuthRepository } from '../../domain/ports/auth-repository.port';

/**
 * Caso de Uso: Registrar nuevo usuario
 */
export class RegisterUseCase {
  constructor(private authRepository: IAuthRepository) {}

  execute(username: string, email: string, password: string): Observable<void> {
    if (!username || username.trim() === '') {
      throw new Error('El nombre de usuario es requerido');
    }

    if (!email || email.trim() === '') {
      throw new Error('El email es requerido');
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('El formato del email es inválido');
    }

    if (!password || password.trim() === '') {
      throw new Error('La contraseña es requerida');
    }

    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    return this.authRepository.register(username, email, password);
  }
}
