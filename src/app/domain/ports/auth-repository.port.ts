import { Observable } from 'rxjs';
import { User } from '../models/user.model';

/**
 * Puerto (Interface) para autenticación
 */
export interface IAuthRepository {
  login(username: string, password: string): Observable<User>;
  register(uuid: string, username: string, email: string, password: string): Observable<void>;
  refreshToken(refreshToken: string): Observable<User>;
  logout(): void;
  forgotPassword(email: string): Observable<void>;
  resetPassword(token: string, password: string): Observable<void>;
  verifyAccount(token: string): Observable<void>;
}

/**
 * Token de inyección de dependencias
 */
export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';
