import { Observable } from 'rxjs';
import { Document } from '../../domain/models/document.model';
import { IDocumentRepository } from '../../domain/ports/document-repository.port';

/**
 * Caso de Uso: Actualizar un documento
 */
export class UpdateDocumentUseCase {
  constructor(private repository: IDocumentRepository) {}

  execute(collectionName: string, id: number, data: Record<string, any>): Observable<Document> {
    if (!collectionName || collectionName.trim() === '') {
      throw new Error('El nombre de la colección es requerido');
    }

    if (!id || id <= 0) {
      throw new Error('El ID del documento es inválido');
    }

    if (!data || Object.keys(data).length === 0) {
      throw new Error('Los datos del documento son requeridos');
    }

    return this.repository.update(collectionName, id, data);
  }
}
