import { Observable } from 'rxjs';
import { Collection } from '../../domain/models/collection.model';
import { ICollectionRepository } from '../../domain/ports/collection-repository.port';

/**
 * Caso de Uso: Crear una nueva colección
 */
export class CreateCollectionUseCase {
  constructor(private repository: ICollectionRepository) {}

  execute(name: string, schema: Record<string, any>): Observable<Collection> {
    // Aquí podrías agregar validaciones de negocio
    if (!name || name.trim() === '') {
      throw new Error('El nombre de la colección es requerido');
    }

    if (!schema || Object.keys(schema).length === 0) {
      throw new Error('El esquema de la colección es requerido');
    }

    return this.repository.create(name, schema);
  }
}
