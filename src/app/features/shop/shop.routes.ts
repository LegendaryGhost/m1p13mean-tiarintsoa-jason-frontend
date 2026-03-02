import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { MesDemandesComponent } from './mes-demandes/mes-demandes.component';
import { MesBoutiquesComponent } from './mes-boutiques/mes-boutiques.component';

@Component({
  standalone: true,
  template: `<h1>Boutique Dashboard</h1><p>Gérez vos produits et promotions ici.</p>`
})
class ShopHomeComponent {}

export const SHOP_ROUTES: Routes = [
  { path: '', component: ShopHomeComponent },
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
