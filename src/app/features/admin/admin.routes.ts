import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { PendingRegistrationsComponent } from './pending-registrations/pending-registrations.component';

@Component({
  standalone: true,
  template: `<h1>Admin Dashboard (Protected)</h1><p>If you see this, the Role Guard works!</p>`
})
class AdminHomeComponent {}

export const ADMIN_ROUTES: Routes = [
  { path: '', component: AdminHomeComponent },
  { path: 'pending-registrations', component: PendingRegistrationsComponent }
];
export default ADMIN_ROUTES;
