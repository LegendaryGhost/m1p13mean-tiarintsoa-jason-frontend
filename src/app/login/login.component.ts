import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    FormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login-wrapper">
      <p-card header="Connexion">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            pInputText
            id="email"
            [value]="email()"
            (input)="email.set($any($event.target).value)"
            placeholder="Email"
            type="email"
            class="w-full" />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <p-password
            [(ngModel)]="passwordValue"
            (ngModelChange)="password.set($event)"
            inputId="password"
            placeholder="Mot de passe"
            [toggleMask]="true"
            [feedback]="false"
            styleClass="w-full">
            <ng-template pTemplate="input">
              <input
                pPassword
                id="password"
                type="password"
                class="w-full"
                placeholder="Mot de passe" />
            </ng-template>
          </p-password>
        </div>

        <p-button
          label="{{ isLoading() ? 'Connexion en cours...' : 'Se connecter' }}"
          (onClick)="onSubmit()"
          [disabled]="isLoading()"
          [loading]="isLoading()"
          styleClass="w-full" />

        @if (errorMessage()) {
          <p-message severity="error" [text]="errorMessage()" styleClass="w-full mt-3" />
        }

        <div class="register-link">
          <p>Pas encore de compte ? <a (click)="goToRegister()">S'inscrire</a></p>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--primary-light) 100%);
    }

    :host ::ng-deep .p-card {
      width: 100%;
      max-width: 400px;
      box-shadow: 0 8px 24px rgba(25, 118, 210, 0.12);
      border-radius: 12px;
      border: 1px solid var(--border-color);
      background: var(--bg-primary);
    }

    :host ::ng-deep .p-card-header {
      text-align: center;
      font-size: 2rem;
      font-weight: 700;
      line-height: 1.2;
      color: var(--primary-color);
      background: linear-gradient(to right, var(--primary-color), var(--accent-color));
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .w-full {
      width: 100%;
    }

    :host ::ng-deep .p-inputtext {
      border-color: var(--border-color);
      color: var(--text-primary);
    }

    :host ::ng-deep .p-inputtext:enabled:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.2rem rgba(25, 118, 210, 0.25);
    }

    :host ::ng-deep .p-password {
      width: 100%;
    }

    :host ::ng-deep .p-password input {
      width: 100%;
      border-color: var(--border-color);
      color: var(--text-primary);
    }

    :host ::ng-deep .p-password input:enabled:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.2rem rgba(25, 118, 210, 0.25);
    }

    :host ::ng-deep .p-button {
      background: var(--primary-color);
      border-color: var(--primary-color);
      transition: all 0.3s ease;
    }

    :host ::ng-deep .p-button:enabled:hover {
      background: var(--primary-dark);
      border-color: var(--primary-dark);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
    }

    :host ::ng-deep .p-button:enabled:active {
      transform: translateY(0);
    }

    :host ::ng-deep .p-message {
      background: rgba(244, 67, 54, 0.1);
      border-color: var(--error-color);
      color: var(--error-color);
    }

    .mt-3 {
      margin-top: 1rem;
    }

    .register-link {
      margin-top: 1.5rem;
      text-align: center;
    }

    .register-link p {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .register-link a {
      color: var(--accent-color);
      text-decoration: none;
      cursor: pointer;
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .register-link a:hover {
      color: var(--accent-dark);
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
  passwordValue = '';
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
