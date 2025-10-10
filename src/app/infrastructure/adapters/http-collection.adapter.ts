import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ICollectionRepository } from '../../domain/ports/collection-repository.port';
import { Collection } from '../../domain/models/collection.model';
import { environment } from '../../../environments/environment';

/**
 * Adaptador HTTP para colecciones
 * Implementa ICollectionRepository usando HttpClient
 */
@Injectable()
export class HttpCollectionAdapter implements ICollectionRepository {
  private apiUrl = `${environment.apiUrl}/collections`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Collection[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(collections => collections.map(c => Collection.fromResponse(c)))
    );
  }

  getById(name: string): Observable<Collection> {
    return this.http.get<any>(`${this.apiUrl}/${name}`).pipe(
      map(collection => Collection.fromResponse(collection))
    );
  }

  create(name: string, schema: Record<string, any>): Observable<Collection> {
    return this.http.post<any>(this.apiUrl, { collectionName: name, schema }).pipe(
      map(collection => Collection.fromResponse(collection))
    );
  }

  delete(name: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${name}`);
  }
}
