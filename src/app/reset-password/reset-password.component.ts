import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';

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

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatch });

    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  passwordsMatch(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.resetForm.valid && this.token) {
      this.loading = true;
      this.auth.resetPassword(this.token, this.resetForm.value.newPassword).subscribe({
        next: (res) => {
          this.submitted = true;
          this.loading = false;
          this.error = null;
        },
        error: (err) => {
          this.error = 'Failed to reset password. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.resetForm.markAllAsTouched();
    }
  }
}
