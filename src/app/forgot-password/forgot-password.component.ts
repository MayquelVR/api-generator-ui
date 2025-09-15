import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { RouterModule } from '@angular/router';

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

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      this.loading = true;
      this.auth.forgotPassword(this.forgotForm.value.email).subscribe({
        next: (res) => {
          this.submitted = true;
          this.loading = false;
          this.error = null;
        },
        error: (err) => {
          this.error = 'Failed to send reset email. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.forgotForm.markAllAsTouched();
    }
  }
}
