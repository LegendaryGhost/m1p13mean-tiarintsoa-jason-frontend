import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { User } from '../models/user.model';

interface UserCredentials {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:3000/api/auth';

  // Using Signals for synchronous access to auth state across the app
  currentUser = signal<User | null>(this.getUserFromStorage());
  isAuthenticated = computed(() => !!this.currentUser());

  login(credentials: UserCredentials) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        // Your backend uses a 'res.success' wrapper, extract the data accordingly
        const { token, user } = res.data;
        this.handleAuth(token, user);
      })
    );
  }

  private handleAuth(token: string, user: User) {
    localStorage.setItem('mall_token', token);
    localStorage.setItem('mall_user', JSON.stringify(user));
    this.currentUser.set(user);
    this.router.navigate(['/']);
  }

  logout() {
    localStorage.removeItem('mall_token');
    localStorage.removeItem('mall_user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('mall_user');
    return user ? JSON.parse(user) : null;
  }

  getToken() {
    return localStorage.getItem('mall_token');
  }
}
