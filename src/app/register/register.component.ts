import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-register',
  template: `
    <div class="register-container">
      <h2>Inscription</h2>

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
          placeholder="Mot de passe (min. 6 caractères)"
          type="password" />
      </div>

      <div class="form-group">
        <label for="nom">Nom</label>
        <input
          id="nom"
          [value]="nom()"
          (input)="nom.set($any($event.target).value)"
          placeholder="Nom"
          type="text" />
      </div>

      <div class="form-group">
        <label for="prenom">Prénom</label>
        <input
          id="prenom"
          [value]="prenom()"
          (input)="prenom.set($any($event.target).value)"
          placeholder="Prénom"
          type="text" />
      </div>

      <div class="form-group">
        <label for="role">Rôle</label>
        <select
          id="role"
          [value]="role()"
          (change)="role.set($any($event.target).value)">
          <option value="acheteur">Acheteur</option>
          <option value="boutique">Boutique</option>
          <option value="admin">Administrateur</option>
        </select>
      </div>

      <button (click)="onSubmit()" [disabled]="isLoading() || !isFormValid()">
        {{ buttonLabel() }}
      </button>

      @if (errorMessage()) {
        <p class="error-message">{{ errorMessage() }}</p>
      }

      <div class="login-link">
        <p>Déjà inscrit ? <a (click)="goToLogin()">Se connecter</a></p>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
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

    input, select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }

    input:focus, select:focus {
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

    .login-link {
      margin-top: 20px;
      text-align: center;
    }

    .login-link p {
      color: #666;
      font-size: 14px;
    }

    .login-link a {
      color: #4CAF50;
      text-decoration: none;
      cursor: pointer;
      font-weight: 500;
    }

    .login-link a:hover {
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
