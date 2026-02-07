import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './login/login.component';
import { InteractiveMapComponent } from './features/buyer/interactive-map/interactive-map.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
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
