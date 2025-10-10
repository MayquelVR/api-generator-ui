import { Observable } from 'rxjs';
import { Document } from '../../domain/models/document.model';
import { IDocumentRepository } from '../../domain/ports/document-repository.port';

/**
 * Caso de Uso: Obtener todos los documentos de una colección
 */
export class GetDocumentsUseCase {
  constructor(private repository: IDocumentRepository) {}

  execute(collectionName: string): Observable<Document[]> {
    if (!collectionName || collectionName.trim() === '') {
      throw new Error('El nombre de la colección es requerido');
    }

    return this.repository.getAll(collectionName);
  }
}
