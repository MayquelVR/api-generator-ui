import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { RouterModule, Router } from '@angular/router';

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

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.auth.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.loginError = null;
          this.loading = false;
          // Save JWT token to localStorage
          if (res.token) {
            localStorage.setItem('auth_token', res.token);
          }
          // Redirect to collections page
          this.router.navigate(['/collections']);
        },
        error: (err) => {
          this.loginError = 'Invalid username or password.';
          this.loading = false;
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
