import { Routes } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `<h1>Boutique Dashboard</h1><p>Manage your products and promos here.</p>`
})
class ShopHomeComponent {}

export const SHOP_ROUTES: Routes = [
  { path: '', component: ShopHomeComponent }
];
export default SHOP_ROUTES;
