import { Observable } from 'rxjs';
import { Document } from '../../domain/models/document.model';
import { IDocumentRepository } from '../../domain/ports/document-repository.port';
import { generateUuidV7 } from '../../infrastructure/utils/uuid.util';

/**
 * Caso de Uso: Crear un nuevo documento
 * Genera automáticamente un UUID v7 si no se proporciona uno
 */
export class CreateDocumentUseCase {
  constructor(private repository: IDocumentRepository) {}

  execute(collectionName: string, data: Record<string, any>, uuid?: string): Observable<Document> {
    if (!collectionName || collectionName.trim() === '') {
      throw new Error('El nombre de la colección es requerido');
    }

    if (!data || Object.keys(data).length === 0) {
      throw new Error('Los datos del documento son requeridos');
    }

    // Generar UUID v7 si no se proporciona uno
    const documentUuid = uuid || generateUuidV7();

    return this.repository.create(collectionName, data, documentUuid);
  }
}
