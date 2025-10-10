import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, InjectionToken } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

// Puertos
import { ICollectionRepository } from './domain/ports/collection-repository.port';
import { IDocumentRepository } from './domain/ports/document-repository.port';
import { IAuthRepository } from './domain/ports/auth-repository.port';
import { IStoragePort } from './domain/ports/storage.port';

// Adaptadores
import { HttpCollectionAdapter } from './infrastructure/adapters/http-collection.adapter';
import { HttpDocumentAdapter } from './infrastructure/adapters/http-document.adapter';
import { HttpAuthAdapter } from './infrastructure/adapters/http-auth.adapter';
import { LocalStorageAdapter } from './infrastructure/adapters/local-storage.adapter';

// Tokens de inyección
export const COLLECTION_REPOSITORY = new InjectionToken<ICollectionRepository>('COLLECTION_REPOSITORY');
export const DOCUMENT_REPOSITORY = new InjectionToken<IDocumentRepository>('DOCUMENT_REPOSITORY');
export const AUTH_REPOSITORY = new InjectionToken<IAuthRepository>('AUTH_REPOSITORY');
export const STORAGE_PORT = new InjectionToken<IStoragePort>('STORAGE_PORT');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),

    // 🏗️ Configuración de Arquitectura Hexagonal
    // Binding de puertos a sus implementaciones
    { provide: COLLECTION_REPOSITORY, useClass: HttpCollectionAdapter },
    { provide: DOCUMENT_REPOSITORY, useClass: HttpDocumentAdapter },
    { provide: AUTH_REPOSITORY, useClass: HttpAuthAdapter },
    { provide: STORAGE_PORT, useClass: LocalStorageAdapter },
  ]
};
