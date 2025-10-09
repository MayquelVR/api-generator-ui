import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SafeHtml } from '@angular/platform-browser';
import { CollectionService, CollectionResponse, CollectionWithSchemaResponse } from '../services/collection.service';
import { AuthService } from '../services/auth.service';
import { JsonFormatterService } from '../services/json-formatter.service';

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
  collections: CollectionResponse[] = [];
  loading = false;
  error: string | null = null;
  expandedSchemas: Map<string, any> = new Map();
  loadingSchemas: Set<string> = new Set();

  constructor(
    private collectionService: CollectionService,
    private authService: AuthService,
    private router: Router,
    private jsonFormatter: JsonFormatterService
  ) {}

  ngOnInit() {
    this.loadCollections();
  }

  loadCollections() {
    this.loading = true;
    this.error = null;
    this.collectionService.listCollections().subscribe({
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
      this.collectionService.deleteCollection(collectionName).subscribe({
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
      this.collectionService.getCollection(collectionName).subscribe({
        next: (response: CollectionWithSchemaResponse) => {
          this.expandedSchemas.set(collectionName, response.schema);
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
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
