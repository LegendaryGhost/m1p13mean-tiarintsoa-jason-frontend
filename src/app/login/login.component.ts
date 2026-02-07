import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <h2>Connexion</h2>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          [value]="email()"
          (input)="email.set($any($event.target).value)"
          placeholder="Email"
          type="email" />
      </div>

      <div class="form-group">
        <label for="password">Mot de passe</label>
        <input
          id="password"
          [value]="password()"
          (input)="password.set($any($event.target).value)"
          placeholder="Mot de passe"
          type="password" />
      </div>

      <button (click)="onSubmit()" [disabled]="isLoading()">
        {{ isLoading() ? 'Connexion en cours...' : 'Se connecter' }}
      </button>

      @if (errorMessage()) {
        <p class="error-message">{{ errorMessage() }}</p>
      }

      <div class="register-link">
        <p>Pas encore de compte ? <a (click)="goToRegister()">S'inscrire</a></p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      padding: 30px;
      border: 1px solid #ddd;
      border-radius: 8px;
      max-width: 400px;
      margin: 50px auto;
      background-color: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    h2 {
      margin-top: 0;
      margin-bottom: 24px;
      text-align: center;
      color: #333;
    }

    .form-group {
      margin-bottom: 16px;
    }

    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #555;
    }

    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #4CAF50;
    }

    button {
      width: 100%;
      padding: 12px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 8px;
    }

    button:hover:not(:disabled) {
      background-color: #45a049;
    }

    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .error-message {
      color: #f44336;
      margin-top: 12px;
      font-size: 14px;
      text-align: center;
    }

    .register-link {
      margin-top: 20px;
      text-align: center;
    }

    .register-link p {
      color: #666;
      font-size: 14px;
    }

    .register-link a {
      color: #4CAF50;
      text-decoration: none;
      cursor: pointer;
      font-weight: 500;
    }

    .register-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Component State using Signals
  email = signal('');
  password = signal('');
  isLoading = signal(false);
  errorMessage = signal('');

  onSubmit() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login({
      email: this.email(),
      password: this.password()
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Connexion échouée: ' + (err.error?.message || err.message));
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
