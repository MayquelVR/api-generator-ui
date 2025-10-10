import { Observable } from 'rxjs';
import { ICollectionRepository } from '../../domain/ports/collection-repository.port';

/**
 * Caso de Uso: Eliminar una colección
 */
export class DeleteCollectionUseCase {
  constructor(private repository: ICollectionRepository) {}

  execute(name: string): Observable<void> {
    if (!name || name.trim() === '') {
      throw new Error('El nombre de la colección es requerido');
    }

    return this.repository.delete(name);
  }
}
