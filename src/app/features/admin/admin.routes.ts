import { Routes } from '@angular/router';
import { PendingRegistrationsComponent } from './pending-registrations/pending-registrations.component';
import { CategoriesComponent } from './categories/categories.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'pending-registrations', component: PendingRegistrationsComponent },
  { path: 'categories', component: CategoriesComponent }
];
export default ADMIN_ROUTES;
