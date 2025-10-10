import { Observable } from 'rxjs';
import { Collection } from '../../domain/models/collection.model';
import { ICollectionRepository } from '../../domain/ports/collection-repository.port';

/**
 * Caso de Uso: Obtener todas las colecciones
 */
export class GetCollectionsUseCase {
  constructor(private repository: ICollectionRepository) {}

  execute(): Observable<Collection[]> {
    return this.repository.getAll();
  }
}
