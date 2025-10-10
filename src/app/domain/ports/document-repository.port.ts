import { Observable } from 'rxjs';
import { Document } from '../models/document.model';

/**
 * Puerto (Interface) para el repositorio de documentos
 */
export interface IDocumentRepository {
  getAll(collectionName: string): Observable<Document[]>;
  getById(collectionName: string, id: number): Observable<Document>;
  create(collectionName: string, data: Record<string, any>): Observable<Document>;
  update(collectionName: string, id: number, data: Record<string, any>): Observable<Document>;
  delete(collectionName: string, id: number): Observable<void>;
}

/**
 * Token de inyección de dependencias
 */
export const DOCUMENT_REPOSITORY = 'DOCUMENT_REPOSITORY';
