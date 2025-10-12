import { Observable } from 'rxjs';
import { Document } from '../../domain/models/document.model';
import { IDocumentRepository } from '../../domain/ports/document-repository.port';

/**
 * Caso de Uso: Obtener un documento por UUID
 */
export class GetDocumentByIdUseCase {
  constructor(private repository: IDocumentRepository) {}

  execute(collectionName: string, uuid: string): Observable<Document> {
    if (!collectionName || collectionName.trim() === '') {
      throw new Error('El nombre de la colección es requerido');
    }

    if (!uuid || uuid.trim() === '') {
      throw new Error('El UUID del documento es inválido');
    }

    return this.repository.getById(collectionName, uuid);
  }
}
