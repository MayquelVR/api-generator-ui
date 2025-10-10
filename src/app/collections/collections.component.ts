import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SafeHtml } from '@angular/platform-browser';
import { JsonFormatterService } from '../services/json-formatter.service';
import { Collection } from '../domain/models/collection.model';
import { GetCollectionsUseCase } from '../application/use-cases/get-collections.use-case';
import { DeleteCollectionUseCase } from '../application/use-cases/delete-collection.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { ICollectionRepository } from '../domain/ports/collection-repository.port';
import { IAuthRepository } from '../domain/ports/auth-repository.port';
import { IStoragePort } from '../domain/ports/storage.port';
import { COLLECTION_REPOSITORY, AUTH_REPOSITORY, STORAGE_PORT } from '../app.config';

interface SchemaField {
  name: string;
  type: string;
  level: number;
}

@Component({
  selector: 'apigen-collections',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
})
export class CollectionsComponent implements OnInit {
  collections: Collection[] = [];
  loading = false;
  error: string | null = null;
  expandedSchemas: Map<string, any> = new Map();
  loadingSchemas: Set<string> = new Set();

  // 🏗️ Casos de Uso (Hexagonal Architecture)
  private getCollectionsUseCase: GetCollectionsUseCase;
  private deleteCollectionUseCase: DeleteCollectionUseCase;
  private logoutUseCase: LogoutUseCase;

  constructor(
    @Inject(COLLECTION_REPOSITORY) private collectionRepository: ICollectionRepository,
    @Inject(AUTH_REPOSITORY) private authRepository: IAuthRepository,
    @Inject(STORAGE_PORT) private storage: IStoragePort,
    private router: Router,
    private jsonFormatter: JsonFormatterService
  ) {
    // Instanciar casos de uso
    this.getCollectionsUseCase = new GetCollectionsUseCase(this.collectionRepository);
    this.deleteCollectionUseCase = new DeleteCollectionUseCase(this.collectionRepository);
    this.logoutUseCase = new LogoutUseCase(this.authRepository, this.storage);
  }

  ngOnInit() {
    this.loadCollections();
  }

  loadCollections() {
    this.loading = true;
    this.error = null;

    // 🏗️ Usando GetCollectionsUseCase
    this.getCollectionsUseCase.execute().subscribe({
      next: (collections) => {
        this.collections = collections;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load collections.';
        this.loading = false;
      }
    });
  }

  deleteCollection(collectionName: string) {
    if (confirm(`Are you sure you want to delete collection "${collectionName}"?`)) {
      // 🏗️ Usando DeleteCollectionUseCase
      this.deleteCollectionUseCase.execute(collectionName).subscribe({
        next: () => {
          this.loadCollections();
        },
        error: (err) => {
          this.error = 'Failed to delete collection.';
        }
      });
    }
  }

  toggleSchema(collectionName: string) {
    if (this.expandedSchemas.has(collectionName)) {
      // Hide schema
      this.expandedSchemas.delete(collectionName);
    } else {
      // Load and show schema
      this.loadingSchemas.add(collectionName);

      // 🏗️ Usando el repositorio directamente (podrías crear un GetCollectionByIdUseCase)
      this.collectionRepository.getById(collectionName).subscribe({
        next: (collection: Collection) => {
          this.expandedSchemas.set(collectionName, collection.schema);
          this.loadingSchemas.delete(collectionName);
        },
        error: (err) => {
          this.error = `Failed to load schema for "${collectionName}".`;
          this.loadingSchemas.delete(collectionName);
        }
      });
    }
  }

  isSchemaVisible(collectionName: string): boolean {
    return this.expandedSchemas.has(collectionName);
  }

  isSchemaLoading(collectionName: string): boolean {
    return this.loadingSchemas.has(collectionName);
  }

  getSchemaFields(schema: any): SchemaField[] {
    const fields: SchemaField[] = [];
    this.parseSchemaFields(schema, '', 0, fields);
    return fields;
  }

  getSimpleSchemaView(schema: any): SafeHtml {
    const simplified = this.simplifySchema(schema);
    return this.getColoredJson(simplified);
  }

  simplifySchema(schema: any): any {
    const result: any = {};

    Object.keys(schema).forEach(key => {
      const field = schema[key];

      if (field.type === 'OBJECT' && field.properties) {
        // Para OBJECT, crear un objeto anidado
        result[key] = this.simplifySchema(field.properties);
      } else if (field.type === 'ARRAY' && field.items) {
        // Para ARRAY, mostrar como ["TIPO"]
        if (field.items.type === 'OBJECT' && field.items.properties) {
          result[key] = [this.simplifySchema(field.items.properties)];
        } else {
          result[key] = [field.items.type];
        }
      } else {
        // Para tipos simples, solo mostrar el tipo
        result[key] = field.type;
      }
    });

    return result;
  }

  getColoredJson(data: any): SafeHtml {
    return this.jsonFormatter.getColoredJson(data);
  }

  parseSchemaFields(schema: any, parentPath: string, level: number, fields: SchemaField[]) {
    Object.keys(schema).forEach(key => {
      const field = schema[key];
      const path = parentPath ? `${parentPath}.${key}` : key;

      const schemaField: SchemaField = {
        name: key,
        type: field.type,
        level: level
      };

      fields.push(schemaField);

      // Parse nested properties for OBJECT type
      if (field.type === 'OBJECT' && field.properties) {
        this.parseSchemaFields(field.properties, path, level + 1, fields);
      }

      // Parse array items for ARRAY type
      if (field.type === 'ARRAY' && field.items) {
        if (field.items.type === 'OBJECT' && field.items.properties) {
          const arrayItemField: SchemaField = {
            name: '[] items',
            type: field.items.type,
            level: level + 1
          };
          fields.push(arrayItemField);
          this.parseSchemaFields(field.items.properties, `${path}[]`, level + 2, fields);
        } else {
          const arrayItemField: SchemaField = {
            name: '[] items',
            type: field.items.type,
            level: level + 1
          };
          fields.push(arrayItemField);
        }
      }
    });
  }

  logout() {
    // 🏗️ Usando LogoutUseCase
    this.logoutUseCase.execute();
    this.router.navigate(['/login']);
  }
}
