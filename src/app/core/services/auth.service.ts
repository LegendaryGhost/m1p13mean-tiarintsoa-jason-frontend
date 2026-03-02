import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

interface UserCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  role: 'admin' | 'boutique' | 'acheteur';
  nom: string;
  prenom: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  // Using Signals for synchronous access to auth state across the app
  currentUser = signal<User | null>(this.getUserFromStorage());
  isAuthenticated = computed(() => !!this.currentUser());

  loginAdmin(credentials: UserCredentials) {
    return this.http.post<any>(`${this.apiUrl}/auth/admin/login`, credentials).pipe(
      tap(res => {
        const { token, user } = res.data;
        this.handleAuth(token, user);
      })
    );
  }

  login(credentials: UserCredentials) {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        const { token, user } = res.data;
        this.handleAuth(token, user);
      })
    );
  }

  register(data: RegisterData) {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, data).pipe(
      tap(res => {
        const { token, user } = res.data;
      })
    );
  }

  private handleAuth(token: string, user: User) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('mall_token', token);
      localStorage.setItem('mall_user', JSON.stringify(user));
    }
    this.currentUser.set(user);

    // Redirect based on user role
    switch (user.role) {
      case 'admin':
        this.router.navigate(['/back-office']);
        break;
      case 'boutique':
        this.router.navigate(['/boutique']);
        break;
      case 'acheteur':
        this.router.navigate(['/plan']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('mall_token');
      localStorage.removeItem('mall_user');
    }
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  private getUserFromStorage(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('mall_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  getToken() {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('mall_token');
    }
    return null;
  }
}
