import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TokenRefreshService } from './services/token-refresh.service';

@Component({
  selector: 'apigen-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('api-generator-ui');

  constructor(private tokenRefreshService: TokenRefreshService) {}

  ngOnInit(): void {
    // Iniciar el servicio de auto-refresh del token
    this.tokenRefreshService.startTokenRefresh();
  }

  ngOnDestroy(): void {
    // Detener el servicio al destruir la app
    this.tokenRefreshService.stopTokenRefresh();
  }
}
