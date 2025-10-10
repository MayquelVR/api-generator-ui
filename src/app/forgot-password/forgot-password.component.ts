import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ForgotPasswordUseCase } from '../application/use-cases/forgot-password.use-case';
import { IAuthRepository } from '../domain/ports/auth-repository.port';
import { AUTH_REPOSITORY } from '../app.config';

@Component({
  selector: 'apigen-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  submitted = false;
  loading = false;
  error: string | null = null;

  // 🏗️ Caso de Uso (Hexagonal Architecture)
  private forgotPasswordUseCase: ForgotPasswordUseCase;

  constructor(
    private fb: FormBuilder,
    @Inject(AUTH_REPOSITORY) private authRepository: IAuthRepository
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Instanciar caso de uso
    this.forgotPasswordUseCase = new ForgotPasswordUseCase(this.authRepository);
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      this.loading = true;
      const email = this.forgotForm.value.email;

      // 🏗️ Usando ForgotPasswordUseCase
      this.forgotPasswordUseCase.execute(email).subscribe({
        next: () => {
          this.submitted = true;
          this.loading = false;
          this.error = null;
        },
        error: (err) => {
          this.error = err.message || 'Failed to send reset email. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.forgotForm.markAllAsTouched();
    }
  }
}
