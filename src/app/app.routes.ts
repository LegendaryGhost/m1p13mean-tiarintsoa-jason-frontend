import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { InteractiveMapComponent } from './interactive-map/interactive-map.component';
import { AdminLoginComponent } from './features/admin/login/admin-login.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: InteractiveMapComponent },
      { path: 'plan', component: InteractiveMapComponent },
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
      }
    ]
  },
  // Auth routes outside layout (no sidebar/header)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'back-office/login', component: AdminLoginComponent },
];
