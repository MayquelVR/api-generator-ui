import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { SafeHtml } from '@angular/platform-browser';
import { JsonFormatterService } from '../services/json-formatter.service';
import { Document } from '../domain/models/document.model';
import { GetDocumentsUseCase } from '../application/use-cases/get-documents.use-case';
import { DeleteDocumentUseCase } from '../application/use-cases/delete-document.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { IDocumentRepository } from '../domain/ports/document-repository.port';
import { IAuthRepository } from '../domain/ports/auth-repository.port';
import { IStoragePort } from '../domain/ports/storage.port';
import { DOCUMENT_REPOSITORY, AUTH_REPOSITORY, STORAGE_PORT } from '../app.config';

@Component({
  selector: 'apigen-documents',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {
  collectionName: string = '';
  documents: Document[] = [];
  loading = false;
  error: string | null = null;
  expandedDocuments: Set<string> = new Set();

  // 🏗️ Casos de Uso (Hexagonal Architecture)
  private getDocumentsUseCase: GetDocumentsUseCase;
  private deleteDocumentUseCase: DeleteDocumentUseCase;
  private logoutUseCase: LogoutUseCase;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jsonFormatter: JsonFormatterService,
    @Inject(DOCUMENT_REPOSITORY) private documentRepository: IDocumentRepository,
    @Inject(AUTH_REPOSITORY) private authRepository: IAuthRepository,
    @Inject(STORAGE_PORT) private storage: IStoragePort
  ) {
    // Instanciar casos de uso
    this.getDocumentsUseCase = new GetDocumentsUseCase(this.documentRepository);
    this.deleteDocumentUseCase = new DeleteDocumentUseCase(this.documentRepository);
    this.logoutUseCase = new LogoutUseCase(this.authRepository, this.storage);
  }

  ngOnInit() {
    this.collectionName = this.route.snapshot.paramMap.get('collectionName') || '';
    if (this.collectionName) {
      this.loadDocuments();
    }
  }

  loadDocuments() {
    this.loading = true;
    this.error = null;

    // 🏗️ Usando GetDocumentsUseCase
    this.getDocumentsUseCase.execute(this.collectionName).subscribe({
      next: (documents) => {
        this.documents = documents;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load documents.';
        this.loading = false;
      }
    });
  }

  deleteDocument(documentUuid: string) {
    if (confirm('Are you sure you want to delete this document?')) {
      // 🏗️ Usando DeleteDocumentUseCase
      this.deleteDocumentUseCase.execute(this.collectionName, documentUuid).subscribe({
        next: () => {
          this.loadDocuments();
        },
        error: (err) => {
          this.error = err.message || 'Failed to delete document.';
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

  toggleJsonView(documentUuid: string) {
    if (this.expandedDocuments.has(documentUuid)) {
      this.expandedDocuments.delete(documentUuid);
    } else {
      this.expandedDocuments.add(documentUuid);
    }
  }

  isJsonVisible(documentUuid: string): boolean {
    return this.expandedDocuments.has(documentUuid);
  }

  getColoredJson(data: any): SafeHtml {
    return this.jsonFormatter.getColoredJson(data);
  }

  logout() {
    // 🏗️ Usando LogoutUseCase
    this.logoutUseCase.execute();
    this.router.navigate(['/login']);
  }
}
