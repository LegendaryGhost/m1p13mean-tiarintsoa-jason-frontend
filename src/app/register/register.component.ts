import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';
import { ThemeToggleComponent } from '../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-register',
  imports: [
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    FormsModule,
    RouterModule,
    ThemeToggleComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="register-wrapper">
      <app-theme-toggle [standalone]="true" />
      <p-card header="Inscription Boutique">
        <p class="subtitle">Créez votre compte boutique. Votre demande sera examinée par un administrateur.</p>

        <div class="form-group">
          <label for="email">Email professionnel</label>
          <input
            pInputText
            id="email"
            [value]="email()"
            (input)="email.set($any($event.target).value)"
            placeholder="votre@email.com"
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
              placeholder="Nom du responsable"
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
              placeholder="Prénom du responsable"
              type="text"
              class="w-full" />
          </div>
        </div>

        <p-button
          label="{{ buttonLabel() }}"
          (onClick)="onSubmit()"
          [disabled]="isLoading() || !isFormValid()"
          [loading]="isLoading()"
          styleClass="w-full" />

        @if (successMessage()) {
          <p-message severity="success" [text]="successMessage()" styleClass="w-full mt-3" />
        }

        @if (errorMessage()) {
          <p-message severity="error" [text]="errorMessage()" styleClass="w-full mt-3" />
        }

        <div class="login-link">
          <p>Déjà inscrit ? <a (click)="goToLogin()">Se connecter</a></p>
        </div>

        <div class="map-link">
          <p><a routerLink="/">Retour à la carte</a></p>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .register-wrapper {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background: linear-gradient(135deg, var(--color-background-secondary) 0%, var(--color-primary-light) 100%);
    }

    :host ::ng-deep .p-card {
      width: 100%;
      max-width: 500px;
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
      background: linear-gradient(to right, var(--color-primary), var(--color-accent));
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      text-align: center;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
      padding: 0.75rem;
      background: var(--color-background-secondary);
      border-radius: 6px;
      border-left: 3px solid var(--color-warning);
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
      margin-top: 0.5rem;
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

    :host ::ng-deep .p-button:disabled {
      background: var(--color-text-disabled);
      border-color: var(--color-text-disabled);
    }

    :host ::ng-deep .p-message.p-message-error {
      background: color-mix(in srgb, var(--color-error) 10%, transparent);
      border-color: var(--color-error);
      color: var(--color-error);
    }

    :host ::ng-deep .p-message.p-message-success {
      background: color-mix(in srgb, var(--color-success) 10%, transparent);
      border-color: var(--color-success);
      color: var(--color-success);
    }

    .mt-3 {
      margin-top: 1rem;
    }

    .login-link, .map-link {
      margin-top: 1.5rem;
      text-align: center;
    }

    .login-link p, .map-link p {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

    .login-link a, .map-link a {
      color: var(--color-accent);
      text-decoration: none;
      cursor: pointer;
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .login-link a:hover, .map-link a:hover {
      color: var(--color-accent-dark);
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
  role = signal<'boutique'>('boutique'); // Fixed to boutique role
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
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
    this.successMessage.set('');

    this.authService.register({
      email: this.email(),
      password: this.password(),
      nom: this.nom(),
      prenom: this.prenom(),
      role: this.role()
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Inscription réussie ! Votre compte est en attente d\'approbation par un administrateur.');
        // Clear form
        this.email.set('');
        this.password.set('');
        this.passwordValue = '';
        this.nom.set('');
        this.prenom.set('');
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
