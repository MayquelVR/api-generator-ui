import { Observable } from 'rxjs';
import { Document } from '../../domain/models/document.model';
import { IDocumentRepository } from '../../domain/ports/document-repository.port';

/**
 * Caso de Uso: Crear un nuevo documento
 */
export class CreateDocumentUseCase {
  constructor(private repository: IDocumentRepository) {}

  execute(collectionName: string, data: Record<string, any>): Observable<Document> {
    if (!collectionName || collectionName.trim() === '') {
      throw new Error('El nombre de la colección es requerido');
    }

    if (!data || Object.keys(data).length === 0) {
      throw new Error('Los datos del documento son requeridos');
    }

    return this.repository.create(collectionName, data);
  }
}
