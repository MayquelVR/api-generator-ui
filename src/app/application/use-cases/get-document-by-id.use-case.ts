import { Observable } from 'rxjs';
import { Document } from '../../domain/models/document.model';
import { IDocumentRepository } from '../../domain/ports/document-repository.port';

/**
 * Caso de Uso: Obtener un documento por ID
 */
export class GetDocumentByIdUseCase {
  constructor(private repository: IDocumentRepository) {}

  execute(collectionName: string, id: number): Observable<Document> {
    if (!collectionName || collectionName.trim() === '') {
      throw new Error('El nombre de la colección es requerido');
    }

    if (!id || id <= 0) {
      throw new Error('El ID del documento es inválido');
    }

    return this.repository.getById(collectionName, id);
  }
}
