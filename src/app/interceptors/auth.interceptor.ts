import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap, BehaviorSubject, filter, take, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Variables para manejar el refresh token
let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Skip interceptor for auth endpoints
  if (req.url.includes('/api/auth/login') ||
      req.url.includes('/api/auth/register') ||
      req.url.includes('/api/auth/refresh')) {
    return next(req);
  }

  // PROACTIVE REFRESH: Check if token is about to expire
  if (authService.isAuthenticated() && authService.shouldRefreshToken()) {
    console.log('🔄 Token about to expire, refreshing proactively...');

    if (!isRefreshing) {
      isRefreshing = true;
      refreshTokenSubject.next(null);

      return authService.refreshToken().pipe(
        switchMap((response: any) => {
          console.log('✅ Token refreshed proactively');
          isRefreshing = false;
          refreshTokenSubject.next(response.token);

          // Continue with original request using new token
          const clonedRequest = req.clone({
            setHeaders: {
              Authorization: `Bearer ${response.token}`
            }
          });

          return next(clonedRequest);
        }),
        catchError((err) => {
          console.error('❌ Proactive refresh failed');
          isRefreshing = false;
          authService.logout();
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

  // Get token from AuthService
  const token = authService.getAccessToken();

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
          return handle401Error(req, next, authService, router);
        } else {
          // Other 401 errors (invalid token, etc.)
          authService.logout();
          router.navigate(['/login']);
          return throwError(() => error);
        }
      }

      return throwError(() => error);
    })
  );
};

function handle401Error(
  req: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = authService.getRefreshToken();

    if (!refreshToken) {
      // No refresh token, redirect to login
      isRefreshing = false;
      authService.logout();
      router.navigate(['/login']);
      return throwError(() => new Error('No refresh token available'));
    }

    return authService.refreshToken().pipe(
      switchMap((response: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.token);

        // Retry original request with new token
        const clonedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${response.token}`
          }
        });

        return next(clonedRequest);
      }),
      catchError((err) => {
        // Refresh failed, logout user
        isRefreshing = false;
        authService.logout();
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
