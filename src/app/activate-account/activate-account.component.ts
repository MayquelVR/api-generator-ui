import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VerifyAccountUseCase } from '../application/use-cases/verify-account.use-case';
import { IAuthRepository } from '../domain/ports/auth-repository.port';
import { AUTH_REPOSITORY } from '../app.config';

@Component({
  selector: 'apigen-activate-account',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './activate-account.component.html'
})
export class ActivateAccountComponent implements OnInit {
  message = '';
  success = false;
  loading = true;

  // 🏗️ Caso de Uso (Hexagonal Architecture)
  private verifyAccountUseCase: VerifyAccountUseCase;

  constructor(
    private route: ActivatedRoute,
    @Inject(AUTH_REPOSITORY) private authRepository: IAuthRepository
  ) {
    // Instanciar caso de uso
    this.verifyAccountUseCase = new VerifyAccountUseCase(this.authRepository);
  }

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      // 🏗️ Usando VerifyAccountUseCase
      this.verifyAccountUseCase.execute(token).subscribe({
        next: () => {
          this.message = 'Your account has been activated!';
          this.success = true;
          this.loading = false;
        },
        error: (err) => {
          this.message = err.message || 'Activation failed. The link may be invalid or expired.';
          this.success = false;
          this.loading = false;
        }
      });
    } else {
      this.message = 'No activation token found.';
      this.success = false;
      this.loading = false;
    }
  }
}
