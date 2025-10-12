import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { IStoragePort } from '../domain/ports/storage.port';
import { STORAGE_PORT } from '../app.config';

/**
 * Guard que verifica si el usuario está autenticado
 * Usa arquitectura hexagonal con StoragePort
 */
export const authGuard: CanActivateFn = (route, state) => {
  const storage = inject(STORAGE_PORT);
  const router = inject(Router);

  // Verificar si existe el token de autenticación
  const isAuthenticated = storage.get('auth_token') !== null;

  if (isAuthenticated) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
