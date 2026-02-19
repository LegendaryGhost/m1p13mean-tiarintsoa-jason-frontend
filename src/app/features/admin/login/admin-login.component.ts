import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-login',
  imports: [
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    FormsModule,
    RouterModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-login-wrapper">
      <p-card header="Back-Office">
        <p class="subtitle">Espace administration du centre commercial</p>

        <div class="form-group">
          <label for="email">Email administrateur</label>
          <input
            pInputText
            id="email"
            [value]="email()"
            (input)="email.set($any($event.target).value)"
            placeholder="admin@mall.com"
            type="email"
            class="w-full" />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <p-password
            [(ngModel)]="passwordValue"
            (ngModelChange)="password.set($event)"
            inputId="password"
            placeholder="Mot de passe sécurisé"
            [toggleMask]="true"
            [feedback]="false"
            styleClass="w-full">
            <ng-template pTemplate="input">
              <input
                pPassword
                id="password"
                type="password"
                class="w-full"
                placeholder="Mot de passe sécurisé" />
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

        <div class="map-link">
          <p><a routerLink="/">Retour à la carte</a></p>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .admin-login-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background: linear-gradient(135deg, var(--color-background-secondary) 0%, var(--color-primary-light) 100%);
    }

    :host ::ng-deep .p-card {
      width: 100%;
      max-width: 400px;
      box-shadow: 0 8px 24px color-mix(in srgb, var(--color-primary) 12%, transparent);
      border-radius: 12px;
      border: 1px solid var(--color-border);
      background: var(--color-background-primary);
    }

    :host ::ng-deep .p-card-header {
      text-align: center;
      font-size: 2rem;
      font-weight: 700;
      line-height: 1.2;
      color: var(--color-primary);
    }

    .subtitle {
      text-align: center;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .w-full {
      width: 100%;
    }

    :host ::ng-deep .p-inputtext {
      border-color: var(--color-border);
      color: var(--color-text-primary);
    }

    :host ::ng-deep .p-inputtext:enabled:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 0.2rem color-mix(in srgb, var(--color-primary) 25%, transparent);
    }

    :host ::ng-deep .p-password {
      width: 100%;
    }

    :host ::ng-deep .p-password input {
      width: 100%;
      border-color: var(--color-border);
      color: var(--color-text-primary);
    }

    :host ::ng-deep .p-password input:enabled:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 0.2rem color-mix(in srgb, var(--color-primary) 25%, transparent);
    }

    :host ::ng-deep .p-button {
      background: var(--color-primary);
      border-color: var(--color-primary);
      transition: all 0.3s ease;
    }

    :host ::ng-deep .p-button:enabled:hover {
      background: var(--color-primary-dark);
      border-color: var(--color-primary-dark);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 30%, transparent);
    }

    :host ::ng-deep .p-button:enabled:active {
      transform: translateY(0);
    }

    :host ::ng-deep .p-message {
      background: color-mix(in srgb, var(--color-error) 10%, transparent);
      border-color: var(--color-error);
      color: var(--color-error);
    }

    .mt-3 {
      margin-top: 1rem;
    }

    .map-link {
      margin-top: 1.5rem;
      text-align: center;
    }

    .map-link p {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

    .map-link a {
      color: var(--color-accent);
      text-decoration: none;
      cursor: pointer;
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .map-link a:hover {
      color: var(--color-accent-dark);
      text-decoration: underline;
    }
  `]
})
export class AdminLoginComponent {
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
      next: (response) => {
        this.isLoading.set(false);
        // Check if user is admin
        if (response.user.role !== 'admin') {
          this.errorMessage.set('Accès refusé. Seuls les administrateurs peuvent accéder au back-office.');
          this.authService.logout();
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Connexion échouée: ' + (err.error?.message || err.message));
      }
    });
  }
}
