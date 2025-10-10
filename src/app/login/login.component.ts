import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { IAuthRepository } from '../domain/ports/auth-repository.port';
import { IStoragePort } from '../domain/ports/storage.port';
import { AUTH_REPOSITORY, STORAGE_PORT } from '../app.config';

@Component({
  selector: 'apigen-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  loginError: string | null = null;
  loading = false;

  // 🏗️ Caso de Uso (Hexagonal Architecture)
  private loginUseCase: LoginUseCase;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    @Inject(AUTH_REPOSITORY) private authRepository: IAuthRepository,
    @Inject(STORAGE_PORT) private storage: IStoragePort
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // Instanciar caso de uso
    this.loginUseCase = new LoginUseCase(this.authRepository, this.storage);
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.loginError = null;
      const { username, password } = this.loginForm.value;

      // 🏗️ Usando LoginUseCase
      this.loginUseCase.execute(username, password).subscribe({
        next: (user) => {
          this.loading = false;
          if (user && user.token) {
            this.router.navigate(['/collections']);
          } else {
            this.loginError = 'Invalid response from server.';
          }
        },
        error: (err) => {
          this.loading = false;

          // Extraer mensaje de error del backend
          if (err.error && err.error.message) {
            this.loginError = err.error.message;
          } else if (err.message) {
            this.loginError = err.message;
          } else if (err.status === 401 || err.status === 403) {
            this.loginError = 'Invalid username or password.';
          } else if (err.status === 0) {
            this.loginError = 'Cannot connect to server. Please try again.';
          } else {
            this.loginError = 'An error occurred. Please try again.';
          }
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
