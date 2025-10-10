import { Observable } from 'rxjs';
import { IAuthRepository } from '../../domain/ports/auth-repository.port';

/**
 * Caso de Uso: Verificar cuenta con token
 */
export class VerifyAccountUseCase {
  constructor(private authRepository: IAuthRepository) {}

  execute(token: string): Observable<void> {
    if (!token || token.trim() === '') {
      throw new Error('El token de verificación es requerido');
    }

    return this.authRepository.verifyAccount(token);
  }
}
