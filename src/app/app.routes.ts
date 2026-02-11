import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { InteractiveMapComponent } from './interactive-map/interactive-map.component';

export const routes: Routes = [
  { path: '', component: InteractiveMapComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { roles: ['admin'] },
    loadChildren: () => import('./features/admin/admin.routes')
  },
  {
    path: 'boutique/dashboard',
    canActivate: [authGuard],
    data: { roles: ['boutique'] },
    loadChildren: () => import('./features/shop/shop.routes')
  },
  {
    path: 'plan', // The 2D Interactive Plan
    component: InteractiveMapComponent
    // Public route, no guard needed
  }
];
