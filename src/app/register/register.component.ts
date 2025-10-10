import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { IAuthRepository } from '../domain/ports/auth-repository.port';
import { AUTH_REPOSITORY } from '../app.config';

@Component({
  selector: 'apigen-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  registerForm: FormGroup;
  submitted = false;
  loading = false;
  error: string | null = null;

  // 🏗️ Caso de Uso (Hexagonal Architecture)
  private registerUseCase: RegisterUseCase;

  constructor(
    private fb: FormBuilder,
    @Inject(AUTH_REPOSITORY) private authRepository: IAuthRepository
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatch });

    // Instanciar caso de uso
    this.registerUseCase = new RegisterUseCase(this.authRepository);
  }

  passwordsMatch(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      const { username, email, password } = this.registerForm.value;

      // 🏗️ Usando RegisterUseCase
      this.registerUseCase.execute(username, email, password).subscribe({
        next: () => {
          this.submitted = true;
          this.loading = false;
          this.error = null;
        },
        error: (err) => {
          this.error = err.message || 'Registration failed. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
