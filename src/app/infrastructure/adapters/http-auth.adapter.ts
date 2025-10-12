import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IAuthRepository } from '../../domain/ports/auth-repository.port';
import { User } from '../../domain/models/user.model';
import { environment } from '../../../environments/environment';

/**
 * Adaptador HTTP para autenticación
 */
@Injectable()
export class HttpAuthAdapter implements IAuthRepository {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
      map(response => User.fromLoginResponse(response))
    );
  }

  register(uuid: string, username: string, email: string, password: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/register`, { uuid, username, email, password });
  }

  refreshToken(refreshToken: string): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      map(response => User.fromLoginResponse(response))
    );
  }

  logout(): void {
    // No hay endpoint de logout en el backend (stateless JWT)
    console.log('🔓 Logout executed');
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, { token, password });
  }

  verifyAccount(token: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/verify`, { token });
  }
}
