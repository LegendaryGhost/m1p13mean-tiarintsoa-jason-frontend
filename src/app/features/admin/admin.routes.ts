import { Routes } from '@angular/router';
import { PendingRegistrationsComponent } from './pending-registrations/pending-registrations.component';
import { CategoriesComponent } from './categories/categories.component';
import { DemandesBoutiquesComponent } from './demandes-boutiques/demandes-boutiques.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'pending-registrations', component: PendingRegistrationsComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'demandes-emplacements', component: DemandesBoutiquesComponent }
];
export default ADMIN_ROUTES;
