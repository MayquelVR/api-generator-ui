import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { SafeHtml } from '@angular/platform-browser';
import { CollectionService, DocumentResponse } from '../services/collection.service';
import { AuthService } from '../services/auth.service';
import { JsonFormatterService } from '../services/json-formatter.service';

@Component({
  selector: 'apigen-documents',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {
  collectionName: string = '';
  documents: DocumentResponse[] = [];
  loading = false;
  error: string | null = null;
  expandedDocuments: Set<number> = new Set();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private collectionService: CollectionService,
    private authService: AuthService,
    private jsonFormatter: JsonFormatterService
  ) {}

  ngOnInit() {
    this.collectionName = this.route.snapshot.paramMap.get('collectionName') || '';
    if (this.collectionName) {
      this.loadDocuments();
    }
  }

  loadDocuments() {
    this.loading = true;
    this.error = null;
    this.collectionService.listDocuments(this.collectionName).subscribe({
      next: (documents) => {
        this.documents = documents;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load documents.';
        this.loading = false;
      }
    });
  }

  deleteDocument(documentId: number) {
    if (confirm('Are you sure you want to delete this document?')) {
      this.collectionService.deleteDocument(this.collectionName, documentId).subscribe({
        next: () => {
          this.loadDocuments();
        },
        error: (err) => {
          this.error = 'Failed to delete document.';
        }
      });
    }
  }

  getDocumentKeys(data: any): string[] {
    return Object.keys(data);
  }

  formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '—';
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '[ ]';
      }
      // Show array with items count
      return `[${value.length} item${value.length !== 1 ? 's' : ''}]`;
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return '{ }';
      }
      // Show object with keys count
      return `{${keys.length} field${keys.length !== 1 ? 's' : ''}}`;
    }

    return String(value);
  }

  isComplexValue(value: any): boolean {
    return typeof value === 'object' && value !== null;
  }

  getValueAsJson(value: any): string {
    return JSON.stringify(value, null, 2);
  }

  toggleJsonView(documentId: number) {
    if (this.expandedDocuments.has(documentId)) {
      this.expandedDocuments.delete(documentId);
    } else {
      this.expandedDocuments.add(documentId);
    }
  }

  isJsonVisible(documentId: number): boolean {
    return this.expandedDocuments.has(documentId);
  }

  getColoredJson(data: any): SafeHtml {
    return this.jsonFormatter.getColoredJson(data);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
