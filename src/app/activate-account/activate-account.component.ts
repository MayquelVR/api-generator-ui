import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

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

  constructor(private route: ActivatedRoute, private auth: AuthService) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.auth.verifyAccount(token).subscribe({
        next: (res) => {
          this.message = 'Your account has been activated!';
          this.success = true;
          this.loading = false;
        },
        error: () => {
          this.message = 'Activation failed. The link may be invalid or expired.';
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
