import { Observable } from 'rxjs';
import { Collection } from '../models/collection.model';

/**
 * Puerto (Interface) para el repositorio de colecciones
 * Define el contrato sin implementación
 */
export interface ICollectionRepository {
  getAll(): Observable<Collection[]>;
  getById(name: string): Observable<Collection>;
  create(name: string, schema: Record<string, any>, uuid?: string): Observable<Collection>;
  delete(name: string): Observable<void>;
}

/**
 * Token de inyección de dependencias para Angular
 */
export const COLLECTION_REPOSITORY = 'COLLECTION_REPOSITORY';
