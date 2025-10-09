import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CollectionService, CreateCollectionRequest, FieldDefinition } from '../services/collection.service';

interface FieldNode {
  name: string;
  type: string;
  required: boolean;
  maxLength?: number;
  properties?: FieldNode[];
  items?: FieldNode;
  level: number;
  parent?: FieldNode;
}

@Component({
  selector: 'apigen-create-collection',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './create-collection.component.html',
  styleUrls: ['./create-collection.component.scss']
})
export class CreateCollectionComponent {
  collectionForm: FormGroup;
  loading = false;
  error: string | null = null;

  fieldTypes = ['STRING', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'DATE', 'OBJECT', 'ARRAY'];

  // Tree structure for nested fields
  fieldTree: FieldNode[] = [];

  constructor(
    private fb: FormBuilder,
    private collectionService: CollectionService,
    private router: Router
  ) {
    this.collectionForm = this.fb.group({
      collectionName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]+$/)]]
    });
  }

  addRootField() {
    const newField: FieldNode = {
      name: '',
      type: 'STRING',
      required: false,
      level: 0
    };
    this.fieldTree.push(newField);
  }

  addNestedProperty(parent: FieldNode) {
    if (!parent.properties) {
      parent.properties = [];
    }
    const newField: FieldNode = {
      name: '',
      type: 'STRING',
      required: false,
      level: parent.level + 1,
      parent: parent
    };
    parent.properties.push(newField);
  }

  addArrayItems(parent: FieldNode) {
    const newField: FieldNode = {
      name: 'item',
      type: 'STRING',
      required: false,
      level: parent.level + 1,
      parent: parent
    };
    parent.items = newField;
  }

  removeField(field: FieldNode) {
    if (field.parent) {
      if (field.parent.properties) {
        const index = field.parent.properties.indexOf(field);
        if (index > -1) {
          field.parent.properties.splice(index, 1);
        }
      }
    } else {
      const index = this.fieldTree.indexOf(field);
      if (index > -1) {
        this.fieldTree.splice(index, 1);
      }
    }
  }

  removeArrayItems(parent: FieldNode) {
    parent.items = undefined;
  }

  onTypeChange(field: FieldNode) {
    if (field.type !== 'OBJECT') {
      field.properties = undefined;
    }
    if (field.type !== 'ARRAY') {
      field.items = undefined;
    }
  }

  flattenFields(): FieldNode[] {
    const result: FieldNode[] = [];
    const flatten = (fields: FieldNode[]) => {
      fields.forEach(field => {
        result.push(field);
        if (field.properties) {
          flatten(field.properties);
        }
        if (field.items) {
          result.push(field.items);
          if (field.items.properties) {
            flatten(field.items.properties);
          }
        }
      });
    };
    flatten(this.fieldTree);
    return result;
  }

  buildFieldDefinition(field: FieldNode): FieldDefinition {
    const fieldDef: FieldDefinition = {
      type: field.type as any,
      required: field.required
    };

    if (field.maxLength && field.type === 'STRING') {
      fieldDef.maxLength = field.maxLength;
    }

    if (field.type === 'OBJECT' && field.properties) {
      fieldDef.properties = {};
      field.properties.forEach(prop => {
        if (prop.name) {
          fieldDef.properties![prop.name] = this.buildFieldDefinition(prop);
        }
      });
    }

    if (field.type === 'ARRAY' && field.items) {
      fieldDef.items = this.buildFieldDefinition(field.items);
    }

    return fieldDef;
  }

  validateFields(): boolean {
    const allFields = this.flattenFields();
    for (const field of allFields) {
      if (!field.name && field.name !== 'item') {
        this.error = 'All fields must have a name.';
        return false;
      }
    }
    return true;
  }

  onSubmit() {
    if (this.collectionForm.valid && this.fieldTree.length > 0) {
      if (!this.validateFields()) {
        return;
      }

      this.loading = true;
      this.error = null;

      // Build schema from field tree
      const schema: Record<string, FieldDefinition> = {};
      this.fieldTree.forEach(field => {
        if (field.name) {
          schema[field.name] = this.buildFieldDefinition(field);
        }
      });

      const request: CreateCollectionRequest = {
        collectionName: this.collectionForm.value.collectionName,
        schema: schema
      };

      this.collectionService.createCollection(request).subscribe({
        next: (res) => {
          this.loading = false;
          this.router.navigate(['/collections']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to create collection. Collection name may already exist.';
          this.loading = false;
        }
      });
    } else {
      this.collectionForm.markAllAsTouched();
      if (this.fieldTree.length === 0) {
        this.error = 'You must add at least one field.';
      }
    }
  }
}
