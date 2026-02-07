import { Routes } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `<h1>Admin Dashboard (Protected)</h1><p>If you see this, the Role Guard works!</p>`
})
class AdminHomeComponent {}

export const ADMIN_ROUTES: Routes = [
  { path: 'admin', component: AdminHomeComponent }
];
export default ADMIN_ROUTES;
