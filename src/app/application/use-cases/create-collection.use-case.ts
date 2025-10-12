import { Observable } from 'rxjs';
import { Collection } from '../../domain/models/collection.model';
import { ICollectionRepository } from '../../domain/ports/collection-repository.port';
import { generateUuidV7 } from '../../infrastructure/utils/uuid.util';

/**
 * Caso de Uso: Crear una nueva colección
 * Genera automáticamente un UUID v7 para la nueva colección
 */
export class CreateCollectionUseCase {
  constructor(private repository: ICollectionRepository) {}

  execute(name: string, schema: Record<string, any>, uuid?: string): Observable<Collection> {
    // Validaciones de negocio
    if (!name || name.trim() === '') {
      throw new Error('El nombre de la colección es requerido');
    }

    if (!schema || Object.keys(schema).length === 0) {
      throw new Error('El esquema de la colección es requerido');
    }

    // Generar UUID v7 si no se proporciona uno
    const collectionUuid = uuid || generateUuidV7();

    return this.repository.create(name, schema, collectionUuid);
  }
}
