import { Routes } from '@angular/router';
import { MesDemandesComponent } from './mes-demandes/mes-demandes.component';
import { MesBoutiquesComponent } from './mes-boutiques/mes-boutiques.component';
import { ShopDashboardComponent } from './dashboard/shop-dashboard.component';

export const SHOP_ROUTES: Routes = [
  { path: '', component: ShopDashboardComponent },
  { path: 'mes-boutiques', component: MesBoutiquesComponent },
  { path: 'mes-demandes', component: MesDemandesComponent },
  {
    path: 'produits',
    loadComponent: () =>
      import('./produits/produits.component').then((m) => m.ProduitsComponent),
  },
  {
    path: 'promotions',
    loadComponent: () =>
      import('./promotions/promotions.component').then((m) => m.PromotionsComponent),
  },
];
export default SHOP_ROUTES;
