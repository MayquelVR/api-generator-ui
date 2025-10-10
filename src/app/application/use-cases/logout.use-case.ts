import { IAuthRepository } from '../../domain/ports/auth-repository.port';
import { IStoragePort } from '../../domain/ports/storage.port';

/**
 * Caso de Uso: Cerrar sesión
 */
export class LogoutUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private storage: IStoragePort
  ) {}

  execute(): void {
    // Limpiar storage (compatibilidad con AuthService)
    this.storage.remove('auth_token');      // ← Clave correcta
    this.storage.remove('refresh_token');   // ← Clave correcta
    this.storage.remove('expiresIn');
    this.storage.remove('token_expiration'); // ← Clave correcta

    // Ejecutar logout en el repositorio (si hay acciones adicionales)
    this.authRepository.logout();
  }
}
