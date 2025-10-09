import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
  username: string;
  email: string;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  register(data: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  login(data: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, data).pipe(
      tap(response => {
        this.setAccessToken(response.token);
        this.setRefreshToken(response.refreshToken);

        const expirationTime = Date.now() + response.expiresIn;
        localStorage.setItem('token_expiration', expirationTime.toString());

        localStorage.setItem('user_info', JSON.stringify({
          username: response.username,
          email: response.email
        }));
      })
    );
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(response => {
        // Actualizar tokens
        this.setAccessToken(response.token);
        this.setRefreshToken(response.refreshToken);

        // Actualizar tiempo de expiración
        const expirationTime = Date.now() + response.expiresIn;
        localStorage.setItem('token_expiration', expirationTime.toString());
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, { token, password });
  }

  verifyAccount(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/verify`, { token });
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiration');
    localStorage.removeItem('user_info');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  setAccessToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  }

  // Legacy support
  getToken(): string | null {
    return this.getAccessToken();
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  shouldRefreshToken(): boolean {
    const expirationTime = localStorage.getItem('token_expiration');
    if (!expirationTime) {
      return false;
    }

    const timeLeft = parseInt(expirationTime) - Date.now();

    const shouldRefresh = timeLeft < 5 * 60 * 1000; // 5 minutos
    if (shouldRefresh) {
    }

    return shouldRefresh;
  }
}
