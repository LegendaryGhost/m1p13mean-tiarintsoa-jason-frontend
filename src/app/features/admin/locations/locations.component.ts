import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { LocationService } from '../../../core/services/location.service';
import { LocationEmplacementPopulated } from '../../../core/models/location-emplacement.model';
import { GenericListComponent } from '../../../shared/components/generic-list/generic-list.component';
import { PageListLayoutComponent } from '../../../shared/components/page-list-layout/page-list-layout.component';
import { ListConfig } from '../../../shared/components/generic-list/generic-list.types';

@Component({
  selector: 'app-locations',
  imports: [GenericListComponent, PageListLayoutComponent],
  providers: [MessageService],
  templateUrl: './locations.component.html',
  styleUrl: './locations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationsComponent implements OnInit {
  private locationService = inject(LocationService);
  private messageService = inject(MessageService);

  locations = signal<LocationEmplacementPopulated[]>([]);
  loading = signal(false);

  listConfig: ListConfig<LocationEmplacementPopulated> = {
    emptyMessage: 'Aucune location trouvée',
    emptyIcon: 'pi-map-marker',
    columns: [
      { field: 'boutiqueId.nom', header: 'Boutique', cellType: 'text' },
      { field: 'emplacementId.numero', header: 'Emplacement n°', cellType: 'text' },
      { field: 'dateDebut', header: 'Début', cellType: 'date' },
      { field: 'dateFin', header: 'Fin', cellType: 'date' },
      {
        field: 'dateFin',
        header: 'Statut',
        cellType: 'badge',
        badgeValue: (row) => (row.dateFin == null || new Date(row.dateFin) >= new Date() ? 'Active' : 'Terminée'),
        badgeSeverity: (row) =>
          row.dateFin == null || new Date(row.dateFin) >= new Date() ? 'success' : 'secondary',
      },
      { field: 'createdAt', header: 'Créée le', cellType: 'date' },
    ],
  };

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.loading.set(true);
    this.locationService.getAll().subscribe({
      next: (data) => {
        this.locations.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les locations',
        });
        this.loading.set(false);
      },
    });
  }
}
