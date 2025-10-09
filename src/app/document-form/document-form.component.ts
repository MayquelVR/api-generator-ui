import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CollectionService, CreateDocumentRequest, UpdateDocumentRequest, FieldDefinition, CollectionWithSchemaResponse } from '../services/collection.service';

interface FormFieldNode {
  name: string;
  path: string; // dot notation path, e.g., "direccion.calle"
  type: string;
  required: boolean;
  maxLength?: number;
  level: number;
  isArrayItem?: boolean;
  arrayParentPath?: string;
}

@Component({
  selector: 'apigen-document-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.scss']
})
export class DocumentFormComponent implements OnInit {
  collectionName: string = '';
  documentId: number | null = null;
  documentForm: FormGroup;
  loading = false;
  loadingSchema = false;
  error: string | null = null;
  isEditMode = false;

  // Schema from backend
  collectionSchema: Record<string, FieldDefinition> = {};
  formFields: FormFieldNode[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private collectionService: CollectionService
  ) {
    this.documentForm = this.fb.group({});
  }

  ngOnInit() {
    this.collectionName = this.route.snapshot.paramMap.get('collectionName') || '';
    const docId = this.route.snapshot.paramMap.get('documentId');

    if (docId) {
      this.documentId = parseInt(docId);
      this.isEditMode = true;
    }

    // First load the schema, then initialize form and optionally load document
    this.loadCollectionSchema();
  }

  loadCollectionSchema() {
    this.loadingSchema = true;
    this.collectionService.getCollection(this.collectionName).subscribe({
      next: (response: CollectionWithSchemaResponse) => {
        this.collectionSchema = response.schema;
        this.parseSchema();
        this.buildFormFromSchema();
        this.loadingSchema = false;

        // If edit mode, load the document data
        if (this.isEditMode && this.documentId) {
          this.loadDocument();
        }
      },
      error: (err) => {
        this.error = 'Failed to load collection schema.';
        this.loadingSchema = false;
      }
    });
  }

  parseSchema() {
    // Convert schema to flat list of form fields for easier rendering
    this.formFields = [];
    this.parseSchemaRecursive(this.collectionSchema, '', 0);
  }

  parseSchemaRecursive(schema: Record<string, FieldDefinition>, parentPath: string, level: number) {
    Object.keys(schema).forEach(key => {
      const field = schema[key];
      const fullPath = parentPath ? `${parentPath}.${key}` : key;

      if (field.type === 'OBJECT' && field.properties) {
        // Add the object field itself
        this.formFields.push({
          name: key,
          path: fullPath,
          type: field.type,
          required: field.required || false,
          level: level
        });
        // Recursively parse nested properties
        this.parseSchemaRecursive(field.properties, fullPath, level + 1);
      } else if (field.type === 'ARRAY' && field.items) {
        // Add the array field
        this.formFields.push({
          name: key,
          path: fullPath,
          type: field.type,
          required: field.required || false,
          level: level,
          isArrayItem: true
        });
        // Note: Array items will be added dynamically
      } else {
        // Simple field
        this.formFields.push({
          name: key,
          path: fullPath,
          type: field.type,
          required: field.required || false,
          maxLength: field.maxLength,
          level: level
        });
      }
    });
  }

  buildFormFromSchema() {
    const group = this.buildFormGroupFromSchema(this.collectionSchema);
    this.documentForm = this.fb.group(group);
  }

  buildFormGroupFromSchema(schema: Record<string, FieldDefinition>): any {
    const group: any = {};

    Object.keys(schema).forEach(key => {
      const field = schema[key];
      const validators = [];

      if (field.required) {
        validators.push(Validators.required);
      }
      if (field.maxLength) {
        validators.push(Validators.maxLength(field.maxLength));
      }

      if (field.type === 'OBJECT' && field.properties) {
        // Nested object
        group[key] = this.fb.group(this.buildFormGroupFromSchema(field.properties));
      } else if (field.type === 'ARRAY') {
        // Array - start with empty array
        group[key] = this.fb.array([], validators);
      } else {
        // Simple field
        group[key] = ['', validators];
      }
    });

    return group;
  }

  loadDocument() {
    if (this.documentId) {
      this.loading = true;
      this.collectionService.getDocument(this.collectionName, this.documentId).subscribe({
        next: (document) => {
          this.loading = false;
          // Populate form with existing data
          this.populateFormWithData(document.data, this.documentForm);
        },
        error: (err) => {
          this.error = 'Failed to load document.';
          this.loading = false;
        }
      });
    }
  }

  populateFormWithData(data: any, formGroup: FormGroup) {
    Object.keys(data).forEach(key => {
      const control = formGroup.get(key);
      const value = data[key];

      if (control instanceof FormGroup) {
        // Nested object
        this.populateFormWithData(value, control);
      } else if (control instanceof FormArray) {
        // Array - need to add FormGroups/Controls for each item
        control.clear();
        if (Array.isArray(value)) {
          value.forEach(item => {
            const itemControl = this.createArrayItemControl(key, item);
            control.push(itemControl);
          });
        }
      } else if (control) {
        // Simple field
        control.setValue(value);
      }
    });
  }

  createArrayItemControl(arrayFieldName: string, value?: any): FormControl | FormGroup {
    // Find the field definition for this array
    const fieldDef = this.findFieldDefinition(this.collectionSchema, arrayFieldName);

    if (fieldDef && fieldDef.items) {
      if (fieldDef.items.type === 'OBJECT' && fieldDef.items.properties) {
        // Array of objects
        const group = this.buildFormGroupFromSchema(fieldDef.items.properties);
        const formGroup = this.fb.group(group);
        if (value) {
          this.populateFormWithData(value, formGroup);
        }
        return formGroup;
      }
    }

    // Array of primitives
    return this.fb.control(value || '');
  }

  findFieldDefinition(schema: Record<string, FieldDefinition>, fieldName: string): FieldDefinition | null {
    if (schema[fieldName]) {
      return schema[fieldName];
    }
    // Search in nested objects
    for (const key of Object.keys(schema)) {
      const field = schema[key];
      if (field.type === 'OBJECT' && field.properties) {
        const found = this.findFieldDefinition(field.properties, fieldName);
        if (found) return found;
      }
    }
    return null;
  }

  getFormArray(path: string): FormArray {
    return this.documentForm.get(path) as FormArray;
  }

  addArrayItem(path: string) {
    const formArray = this.getFormArray(path);
    const fieldName = path.split('.').pop() || path;
    const itemControl = this.createArrayItemControl(fieldName);
    formArray.push(itemControl);
  }

  removeArrayItem(path: string, index: number) {
    const formArray = this.getFormArray(path);
    formArray.removeAt(index);
  }

  getArrayItemControls(path: string): any[] {
    const formArray = this.getFormArray(path);
    return formArray.controls;
  }

  isFormControl(control: any): boolean {
    return control instanceof FormControl;
  }

  isFormGroup(control: any): boolean {
    return control instanceof FormGroup;
  }

  asFormControl(control: any): FormControl {
    return control as FormControl;
  }

  asFormGroup(control: any): FormGroup {
    return control as FormGroup;
  }

  getObjectKeysForArrayItem(arrayPath: string): string[] {
    const fieldName = arrayPath.split('.').pop() || arrayPath;
    const fieldDef = this.findFieldDefinition(this.collectionSchema, fieldName);

    if (fieldDef && fieldDef.items && fieldDef.items.type === 'OBJECT' && fieldDef.items.properties) {
      return Object.keys(fieldDef.items.properties);
    }
    return [];
  }

  getArrayItemFieldType(arrayPath: string, fieldKey: string): string {
    const fieldName = arrayPath.split('.').pop() || arrayPath;
    const fieldDef = this.findFieldDefinition(this.collectionSchema, fieldName);

    if (fieldDef && fieldDef.items && fieldDef.items.type === 'OBJECT' && fieldDef.items.properties) {
      const prop = fieldDef.items.properties[fieldKey];
      return prop?.type || 'STRING';
    }
    return 'STRING';
  }

  isArrayItemFieldRequired(arrayPath: string, fieldKey: string): boolean {
    const fieldName = arrayPath.split('.').pop() || arrayPath;
    const fieldDef = this.findFieldDefinition(this.collectionSchema, fieldName);

    if (fieldDef && fieldDef.items && fieldDef.items.type === 'OBJECT' && fieldDef.items.properties) {
      const prop = fieldDef.items.properties[fieldKey];
      return prop?.required || false;
    }
    return false;
  }

  onSubmit() {
    if (this.documentForm.valid) {
      this.loading = true;
      this.error = null;

      const data = this.documentForm.value;

      if (this.isEditMode && this.documentId) {
        // Update existing document
        const request: UpdateDocumentRequest = { data };
        this.collectionService.updateDocument(this.collectionName, this.documentId, request).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/collections', this.collectionName, 'documents']);
          },
          error: (err) => {
            this.error = err.error?.message || 'Failed to update document.';
            this.loading = false;
          }
        });
      } else {
        // Create new document
        const request: CreateDocumentRequest = { data };
        this.collectionService.createDocument(this.collectionName, request).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/collections', this.collectionName, 'documents']);
          },
          error: (err) => {
            this.error = err.error?.message || 'Failed to create document.';
            this.loading = false;
          }
        });
      }
    } else {
      this.documentForm.markAllAsTouched();
    }
  }

  getControl(path: string): FormControl {
    return this.documentForm.get(path) as FormControl;
  }

  getFieldType(path: string): string {
    const field = this.formFields.find(f => f.path === path);
    return field?.type || 'STRING';
  }

  isFieldRequired(path: string): boolean {
    const field = this.formFields.find(f => f.path === path);
    return field?.required || false;
  }

  getFieldMaxLength(path: string): number | undefined {
    const field = this.formFields.find(f => f.path === path);
    return field?.maxLength;
  }
}
