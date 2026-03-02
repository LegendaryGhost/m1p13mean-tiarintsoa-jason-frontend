import { Routes } from '@angular/router';
import { PendingRegistrationsComponent } from './pending-registrations/pending-registrations.component';
import { CategoriesComponent } from './categories/categories.component';
import { DemandesBoutiquesComponent } from './demandes-boutiques/demandes-boutiques.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BoutiquesComponent } from './boutiques/boutiques.component';
import { LocationsComponent } from './locations/locations.component';
import { EtagesComponent } from './etages/etages.component';
import { EmplacementEditorComponent } from './emplacements/emplacement-editor.component';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'pending-registrations', component: PendingRegistrationsComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'demandes-emplacements', component: DemandesBoutiquesComponent },
  { path: 'boutiques', component: BoutiquesComponent },
  { path: 'locations', component: LocationsComponent },
  { path: 'etages', component: EtagesComponent },
  { path: 'emplacements', component: EmplacementEditorComponent },
];
export default ADMIN_ROUTES;
