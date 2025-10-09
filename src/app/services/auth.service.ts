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
      console.log('⚠️ No expiration time found');
      return false;
    }

    const timeLeft = parseInt(expirationTime) - Date.now();
    const minutesLeft = Math.floor(timeLeft / 60000);

    console.log(`⏰ Token expires in ${minutesLeft} minutes (${timeLeft}ms)`);

    const shouldRefresh = timeLeft < 5 * 60 * 1000; // 5 minutos
    if (shouldRefresh) {
      console.log('🔔 Token should be refreshed!');
    }

    return shouldRefresh;
  }

  getTokenInfo(): void {
    const expirationTime = localStorage.getItem('token_expiration');
    const token = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!expirationTime) {
      console.log('❌ No token expiration found');
      return;
    }

    const timeLeft = parseInt(expirationTime) - Date.now();
    const minutesLeft = Math.floor(timeLeft / 60000);
    const secondsLeft = Math.floor((timeLeft % 60000) / 1000);

    console.log('📊 Token Info:');
    console.log(`  - Has Access Token: ${token ? 'Yes' : 'No'}`);
    console.log(`  - Has Refresh Token: ${refreshToken ? 'Yes' : 'No'}`);
    console.log(`  - Expiration: ${new Date(parseInt(expirationTime)).toLocaleString()}`);
    console.log(`  - Time Left: ${minutesLeft}m ${secondsLeft}s`);
    console.log(`  - Should Refresh: ${this.shouldRefreshToken() ? 'YES' : 'NO'}`);
  }
}
