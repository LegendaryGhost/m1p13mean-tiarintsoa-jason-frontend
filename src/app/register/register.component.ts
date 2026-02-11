import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
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
    <div class="register-wrapper">
      <p-card header="Créer un compte">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            pInputText
            id="email"
            [value]="email()"
            (input)="email.set($any($event.target).value)"
            placeholder="Entrez votre email"
            type="email"
            class="w-full" />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <p-password
            [(ngModel)]="passwordValue"
            (ngModelChange)="password.set($event)"
            inputId="password"
            placeholder="Minimum 6 caractères"
            [toggleMask]="true"
            [feedback]="true"
            styleClass="w-full"
            [promptLabel]="'Choisissez un mot de passe'"
            [weakLabel]="'Faible'"
            [mediumLabel]="'Moyen'"
            [strongLabel]="'Fort'">
            <ng-template pTemplate="input">
              <input
                pPassword
                id="password"
                type="password"
                class="w-full"
                placeholder="Minimum 6 caractères" />
            </ng-template>
          </p-password>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="nom">Nom</label>
            <input
              pInputText
              id="nom"
              [value]="nom()"
              (input)="nom.set($any($event.target).value)"
              placeholder="Nom"
              type="text"
              class="w-full" />
          </div>

          <div class="form-group">
            <label for="prenom">Prénom</label>
            <input
              pInputText
              id="prenom"
              [value]="prenom()"
              (input)="prenom.set($any($event.target).value)"
              placeholder="Prénom"
              type="text"
              class="w-full" />
          </div>
        </div>

        <div class="form-group">
          <label for="role">Type de compte</label>
          <select
            id="role"
            class="select-field w-full"
            [value]="role()"
            (change)="role.set($any($event.target).value)">
            <option value="acheteur">Acheteur</option>
            <option value="boutique">Boutique</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>

        <p-button
          label="{{ buttonLabel() }}"
          (onClick)="onSubmit()"
          [disabled]="isLoading() || !isFormValid()"
          [loading]="isLoading()"
          styleClass="w-full" />

        @if (errorMessage()) {
          <p-message severity="error" [text]="errorMessage()" styleClass="w-full mt-3" />
        }

        <div class="login-link">
          <p>Déjà inscrit ? <a (click)="goToLogin()">Se connecter</a></p>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .register-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--primary-light) 100%);
    }

    :host ::ng-deep .p-card {
      width: 100%;
      max-width: 500px;
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    @media (max-width: 480px) {
      .form-row {
        grid-template-columns: 1fr;
      }
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

    .select-field {
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 1rem;
      color: var(--text-primary);
      background-color: var(--bg-primary);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
    }

    .select-field:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.2rem rgba(25, 118, 210, 0.25);
    }

    .select-field:hover {
      border-color: var(--primary-color);
    }

    :host ::ng-deep .p-button {
      background: var(--primary-color);
      border-color: var(--primary-color);
      transition: all 0.3s ease;
      margin-top: 0.5rem;
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

    :host ::ng-deep .p-button:disabled {
      background: var(--text-disabled);
      border-color: var(--text-disabled);
    }

    :host ::ng-deep .p-message {
      background: rgba(244, 67, 54, 0.1);
      border-color: var(--error-color);
      color: var(--error-color);
    }

    .mt-3 {
      margin-top: 1rem;
    }

    .login-link {
      margin-top: 1.5rem;
      text-align: center;
    }

    .login-link p {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .login-link a {
      color: var(--accent-color);
      text-decoration: none;
      cursor: pointer;
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .login-link a:hover {
      color: var(--accent-dark);
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Component State using Signals
  email = signal('');
  password = signal('');
  passwordValue = '';
  nom = signal('');
  prenom = signal('');
  role = signal<'admin' | 'boutique' | 'acheteur'>('acheteur');
  isLoading = signal(false);
  errorMessage = signal('');
  buttonLabel = computed(() =>
    this.isLoading() ? "Inscription en cours..." : "S'inscrire"
  );

  isFormValid = () => {
    return this.email().trim() !== '' &&
           this.password().length >= 6 &&
           this.nom().trim() !== '' &&
           this.prenom().trim() !== '';
  };

  onSubmit() {
    if (!this.isFormValid()) {
      this.errorMessage.set('Veuillez remplir tous les champs correctement');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.register({
      email: this.email(),
      password: this.password(),
      nom: this.nom(),
      prenom: this.prenom(),
      role: this.role()
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        console.log('Registration successful');
        // Navigation is handled by the auth service
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          'Inscription échouée: ' + (err.error?.message || err.message)
        );
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
