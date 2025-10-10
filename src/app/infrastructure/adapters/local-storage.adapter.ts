import { Injectable } from '@angular/core';
import { IStoragePort } from '../../domain/ports/storage.port';

/**
 * Adaptador para localStorage
 */
@Injectable()
export class LocalStorageAdapter implements IStoragePort {
  get(key: string): string | null {
    return localStorage.getItem(key);
  }

  set(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}
