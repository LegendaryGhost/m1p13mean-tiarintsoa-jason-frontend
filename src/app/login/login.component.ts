import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  // Notice: No FormsModule needed if we use native signals + event binding
  template: `
    <div style="padding: 20px; border: 1px solid #ccc; max-width: 300px;">
      <h2>Login (Signals Version)</h2>

      <input
        [value]="email()"
        (input)="email.set($any($event.target).value)"
        placeholder="Email"
        type="email" />
      <br/><br/>

      <input
        [value]="password()"
        (input)="password.set($any($event.target).value)"
        placeholder="Password"
        type="password" />
      <br/><br/>

      <button (click)="onSubmit()" [disabled]="isLoading()">
        {{ isLoading() ? 'Logging in...' : 'Login' }}
      </button>

      @if (errorMessage()) {
        <p style="color: red;">{{ errorMessage() }}</p>
      }
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);

  // Component State using Signals
  email = signal('');
  password = signal('');
  isLoading = signal(false);
  errorMessage = signal('');

  onSubmit() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    // We still subscribe to the HTTP call (Observables are best for one-off events),
    // but we use the result to update our UI Signals.
    this.authService.login({
      email: this.email(),
      password: this.password()
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        console.log('Login successful');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Login failed: ' + (err.error?.message || err.message));
      }
    });
  }
}
