import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-interactive-map',
  standalone: true,
  template: `
    <div style="background: #e0f7fa; padding: 20px;">
      <h1>Mall 2D Plan (Public)</h1>
      <p>User Status: {{ authService.isAuthenticated() ? 'Logged In' : 'Guest' }}</p>
      @if (authService.currentUser(); as user) {
        <p>Welcome back, {{ user.nom }}! (Role: {{ user.role }})</p>
        <button (click)="authService.logout()">Logout</button>
      }
    </div>
  `
})
export class InteractiveMapComponent {
  authService = inject(AuthService);
}
