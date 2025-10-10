import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ResetPasswordUseCase } from '../application/use-cases/reset-password.use-case';
import { IAuthRepository } from '../domain/ports/auth-repository.port';
import { AUTH_REPOSITORY } from '../app.config';

@Component({
  selector: 'apigen-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  submitted = false;
  loading = false;
  error: string | null = null;
  token: string | null = null;

  // 🏗️ Caso de Uso (Hexagonal Architecture)
  private resetPasswordUseCase: ResetPasswordUseCase;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    @Inject(AUTH_REPOSITORY) private authRepository: IAuthRepository
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatch });

    this.token = this.route.snapshot.queryParamMap.get('token');

    // Instanciar caso de uso
    this.resetPasswordUseCase = new ResetPasswordUseCase(this.authRepository);
  }

  passwordsMatch(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.resetForm.valid && this.token) {
      this.loading = true;
      const newPassword = this.resetForm.value.newPassword;

      // 🏗️ Usando ResetPasswordUseCase
      this.resetPasswordUseCase.execute(this.token, newPassword).subscribe({
        next: () => {
          this.submitted = true;
          this.loading = false;
          this.error = null;
        },
        error: (err) => {
          this.error = err.message || 'Failed to reset password. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.resetForm.markAllAsTouched();
    }
  }
}
