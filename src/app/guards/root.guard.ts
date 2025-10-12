import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { IStoragePort } from '../domain/ports/storage.port';
import { STORAGE_PORT } from '../app.config';

/**
 * Guard para la ruta raíz que redirige según el estado de autenticación
 * Usa arquitectura hexagonal con StoragePort
 */
export const rootGuard: CanActivateFn = (route, state) => {
  const storage = inject(STORAGE_PORT);
  const router = inject(Router);

  // Verificar si existe el token de autenticación
  const isAuthenticated = storage.get('auth_token') !== null;

  if (isAuthenticated) {
    router.navigate(['/collections']);
    return false;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
