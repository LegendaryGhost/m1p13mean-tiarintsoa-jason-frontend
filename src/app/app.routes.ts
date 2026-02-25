import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { AdminLayoutComponent } from './features/admin/layout/admin-layout.component';
import { ShopLayoutComponent } from './features/shop/layout/shop-layout.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { InteractiveMapComponent } from './interactive-map/interactive-map.component';
import { AdminLoginComponent } from './features/admin/login/admin-login.component';

export const routes: Routes = [
  // Public routes with main layout
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: InteractiveMapComponent },
      { path: 'plan', component: InteractiveMapComponent }
    ]
  },

  // Back-office routes (Admin) with AdminLayout
  {
    path: 'back-office',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    data: { roles: ['admin'] },
    loadChildren: () => import('./features/admin/admin.routes')
  },

  // Boutique routes (Shop) with ShopLayout
  {
    path: 'boutique',
    component: ShopLayoutComponent,
    canActivate: [authGuard],
    data: { roles: ['boutique'] },
    loadChildren: () => import('./features/shop/shop.routes')
  },

  // Auth routes (no layout)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'back-office/login', component: AdminLoginComponent }
];
