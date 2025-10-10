import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IDocumentRepository } from '../../domain/ports/document-repository.port';
import { Document } from '../../domain/models/document.model';
import { environment } from '../../../environments/environment';

/**
 * Adaptador HTTP para documentos
 */
@Injectable()
export class HttpDocumentAdapter implements IDocumentRepository {
  private apiUrl = `${environment.apiUrl}/collections`;

  constructor(private http: HttpClient) {}

  getAll(collectionName: string): Observable<Document[]> {
    return this.http.get<any>(`${this.apiUrl}/${collectionName}/documents`).pipe(
      map(response => {
        // Si la respuesta es un array directamente
        if (Array.isArray(response)) {
          return response.map(d => Document.fromResponse(d, collectionName));
        }

        // Si la respuesta es un objeto con una propiedad que contiene el array
        const possibleArrays = [
          response.data,
          response.documents,
          response.content,
          response.items,
          response.results
        ];

        for (const arr of possibleArrays) {
          if (Array.isArray(arr)) {
            return arr.map(d => Document.fromResponse(d, collectionName));
          }
        }

        return [];
      })
    );
  }

  getById(collectionName: string, id: number): Observable<Document> {
    return this.http.get<any>(`${this.apiUrl}/${collectionName}/documents/${id}`).pipe(
      map(doc => Document.fromResponse(doc, collectionName))
    );
  }

  create(collectionName: string, data: Record<string, any>): Observable<Document> {
    // El backend espera el formato: { "data": {...} }
    const payload = { data };
    return this.http.post<any>(`${this.apiUrl}/${collectionName}/documents`, payload).pipe(
      map(doc => Document.fromResponse(doc, collectionName))
    );
  }

  update(collectionName: string, id: number, data: Record<string, any>): Observable<Document> {
    // El backend espera el formato: { "data": {...} }
    const payload = { data };
    return this.http.put<any>(`${this.apiUrl}/${collectionName}/documents/${id}`, payload).pipe(
      map(doc => Document.fromResponse(doc, collectionName))
    );
  }

  delete(collectionName: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${collectionName}/documents/${id}`);
  }
}
