/**
 * Puerto (Interface) para almacenamiento local
 */
export interface IStoragePort {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  clear(): void;
}

/**
 * Token de inyección de dependencias
 */
export const STORAGE_PORT = 'STORAGE_PORT';
