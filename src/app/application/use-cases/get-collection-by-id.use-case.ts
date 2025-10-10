import { Observable } from 'rxjs';
import { Collection } from '../../domain/models/collection.model';
import { ICollectionRepository } from '../../domain/ports/collection-repository.port';

/**
 * Caso de Uso: Obtener una colección por nombre
 */
export class GetCollectionByIdUseCase {
  constructor(private repository: ICollectionRepository) {}

  execute(name: string): Observable<Collection> {
    if (!name || name.trim() === '') {
      throw new Error('El nombre de la colección es requerido');
    }

    return this.repository.getById(name);
  }
}
