import { Observable } from 'rxjs';
import { IDocumentRepository } from '../../domain/ports/document-repository.port';

/**
 * Caso de Uso: Eliminar un documento
 */
export class DeleteDocumentUseCase {
  constructor(private repository: IDocumentRepository) {}

  execute(collectionName: string, uuid: string): Observable<void> {
    if (!collectionName || collectionName.trim() === '') {
      throw new Error('El nombre de la colección es requerido');
    }

    if (!uuid || uuid.trim() === '') {
      throw new Error('El UUID del documento es inválido');
    }

    return this.repository.delete(collectionName, uuid);
  }
}
