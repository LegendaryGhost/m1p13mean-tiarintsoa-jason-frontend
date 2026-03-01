import { Routes } from '@angular/router';
import { PendingRegistrationsComponent } from './pending-registrations/pending-registrations.component';
import { CategoriesComponent } from './categories/categories.component';
import { DemandesBoutiquesComponent } from './demandes-boutiques/demandes-boutiques.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BoutiquesComponent } from './boutiques/boutiques.component';
import { LocationsComponent } from './locations/locations.component';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'pending-registrations', component: PendingRegistrationsComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'demandes-emplacements', component: DemandesBoutiquesComponent },
  { path: 'boutiques', component: BoutiquesComponent },
  { path: 'locations', component: LocationsComponent },
];
export default ADMIN_ROUTES;
