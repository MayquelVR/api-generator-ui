import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap, BehaviorSubject, filter, take, Observable } from 'rxjs';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { IAuthRepository } from '../domain/ports/auth-repository.port';
import { IStoragePort } from '../domain/ports/storage.port';
import { AUTH_REPOSITORY, STORAGE_PORT } from '../app.config';

// Variables para manejar el refresh token
let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

/**
 * Interceptor HTTP para manejo de autenticación
 * Usa arquitectura hexagonal con Use Cases
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authRepository = inject(AUTH_REPOSITORY);
  const storage = inject(STORAGE_PORT);

  // Crear use cases
  const refreshTokenUseCase = new RefreshTokenUseCase(authRepository, storage);
  const logoutUseCase = new LogoutUseCase(authRepository, storage);

  // Skip interceptor for auth endpoints
  if (req.url.includes('/api/auth/login') ||
      req.url.includes('/api/auth/register') ||
      req.url.includes('/api/auth/refresh')) {
    return next(req);
  }

  // PROACTIVE REFRESH: Check if token is about to expire
  const isAuthenticated = storage.get('auth_token') !== null;
  if (isAuthenticated && refreshTokenUseCase.shouldRefreshToken()) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshTokenSubject.next(null);

      return refreshTokenUseCase.execute().pipe(
        switchMap((user) => {
          isRefreshing = false;
          refreshTokenSubject.next(user.token);

          // Continue with original request using new token
          const clonedRequest = req.clone({
            setHeaders: {
              Authorization: `Bearer ${user.token}`
            }
          });

          return next(clonedRequest);
        }),
        catchError((err) => {
          isRefreshing = false;
          logoutUseCase.execute();
          router.navigate(['/login']);
          return throwError(() => err);
        })
      );
    } else {
      // Another request is already refreshing, wait for it
      return refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          const clonedRequest = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
          return next(clonedRequest);
        })
      );
    }
  }

  // Get token from storage
  const token = storage.get('auth_token');

  // Clone request and add Authorization header if token exists
  let clonedRequest = req;
  if (token) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 errors (Unauthorized)
      if (error.status === 401) {
        // Check if error is due to token expiration
        const errorMessage = error.error?.error || error.error?.message || '';

        if (errorMessage.includes('Token expired') || errorMessage.includes('expired')) {
          return handle401Error(req, next, refreshTokenUseCase, logoutUseCase, storage, router);
        } else {
          // Other 401 errors (invalid token, etc.)
          logoutUseCase.execute();
          router.navigate(['/login']);
          return throwError(() => error);
        }
      }

      return throwError(() => error);
    })
  );
};

/**
 * Maneja errores 401 intentando refrescar el token
 */
function handle401Error(
  req: HttpRequest<any>,
  next: HttpHandlerFn,
  refreshTokenUseCase: RefreshTokenUseCase,
  logoutUseCase: LogoutUseCase,
  storage: IStoragePort,
  router: Router
): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = storage.get('refresh_token');

    if (!refreshToken) {
      // No refresh token, redirect to login
      isRefreshing = false;
      logoutUseCase.execute();
      router.navigate(['/login']);
      return throwError(() => new Error('No refresh token available'));
    }

    return refreshTokenUseCase.execute().pipe(
      switchMap((user) => {
        isRefreshing = false;
        refreshTokenSubject.next(user.token);

        // Retry original request with new token
        const clonedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${user.token}`
          }
        });

        return next(clonedRequest);
      }),
      catchError((err) => {
        // Refresh failed, logout user
        isRefreshing = false;
        logoutUseCase.execute();
        router.navigate(['/login']);
        return throwError(() => err);
      })
    );
  } else {
    // Wait for refresh to complete
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        const clonedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(clonedRequest);
      })
    );
  }
}
