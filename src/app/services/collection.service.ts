import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FieldDefinition {
  type: 'STRING' | 'INTEGER' | 'DECIMAL' | 'BOOLEAN' | 'DATE' | 'OBJECT' | 'ARRAY';
  required?: boolean;
  maxLength?: number;
  defaultValue?: any;
  properties?: Record<string, FieldDefinition>;
  items?: FieldDefinition;
}

export interface CreateCollectionRequest {
  collectionName: string;
  schema: Record<string, FieldDefinition>;
}

export interface CollectionResponse {
  id: number;
  collectionName: string;
  username: string;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionWithSchemaResponse {
  id: number;
  collectionName: string;
  username: string;
  schema: Record<string, FieldDefinition>;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentResponse {
  id: number;
  collectionId: number;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentRequest {
  data: Record<string, any>;
}

export interface UpdateDocumentRequest {
  data: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private apiUrl = 'http://localhost:8080/api/collections';

  constructor(private http: HttpClient) {}

  // COLLECTIONS

  /**
   * Create a new collection with schema
   */
  createCollection(request: CreateCollectionRequest): Observable<CollectionResponse> {
    return this.http.post<CollectionResponse>(this.apiUrl, request);
  }

  /**
   * List all collections for the authenticated user
   */
  listCollections(): Observable<CollectionResponse[]> {
    return this.http.get<CollectionResponse[]>(this.apiUrl);
  }

  /**
   * Get a collection with its complete schema
   * This is essential to know what fields a document should have
   */
  getCollection(collectionName: string): Observable<CollectionWithSchemaResponse> {
    return this.http.get<CollectionWithSchemaResponse>(`${this.apiUrl}/${collectionName}`);
  }

  /**
   * Delete a collection by name
   */
  deleteCollection(collectionName: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${collectionName}`);
  }

  // DOCUMENTS

  /**
   * Create a new document in a collection
   */
  createDocument(collectionName: string, request: CreateDocumentRequest): Observable<DocumentResponse> {
    return this.http.post<DocumentResponse>(`${this.apiUrl}/${collectionName}/documents`, request);
  }

  /**
   * List all documents in a collection
   */
  listDocuments(collectionName: string): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(`${this.apiUrl}/${collectionName}/documents`);
  }

  /**
   * Get a specific document by ID
   */
  getDocument(collectionName: string, documentId: number): Observable<DocumentResponse> {
    return this.http.get<DocumentResponse>(`${this.apiUrl}/${collectionName}/documents/${documentId}`);
  }

  /**
   * Update a document by ID
   */
  updateDocument(collectionName: string, documentId: number, request: UpdateDocumentRequest): Observable<DocumentResponse> {
    return this.http.put<DocumentResponse>(`${this.apiUrl}/${collectionName}/documents/${documentId}`, request);
  }

  /**
   * Delete a document by ID
   */
  deleteDocument(collectionName: string, documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${collectionName}/documents/${documentId}`);
  }
}
