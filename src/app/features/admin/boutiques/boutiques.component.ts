import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { BoutiquePopulated } from '../../../core/models/boutique.model';
import { GenericListComponent } from '../../../shared/components/generic-list/generic-list.component';
import { PageListLayoutComponent } from '../../../shared/components/page-list-layout/page-list-layout.component';
import { ListConfig } from '../../../shared/components/generic-list/generic-list.types';

@Component({
  selector: 'app-boutiques',
  imports: [GenericListComponent, PageListLayoutComponent],
  providers: [MessageService],
  templateUrl: './boutiques.component.html',
  styleUrl: './boutiques.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoutiquesComponent implements OnInit {
  private boutiqueService = inject(BoutiqueService);
  private messageService = inject(MessageService);

  boutiques = signal<BoutiquePopulated[]>([]);
  loading = signal(false);

  listConfig: ListConfig<BoutiquePopulated> = {
    emptyMessage: 'Aucune boutique trouvée',
    emptyIcon: 'pi-shop',
    columns: [
      { field: 'nom', header: 'Nom', cellType: 'text' },
      { field: 'categorieId.nom', header: 'Catégorie', cellType: 'text' },
      { field: 'userId.nom', header: 'Propriétaire', cellType: 'text' },
      { field: 'heureOuverture', header: 'Ouverture', cellType: 'text' },
      { field: 'heureFermeture', header: 'Fermeture', cellType: 'text' },
      {
        field: 'statut',
        header: 'Statut',
        cellType: 'badge',
        badgeValue: (row) => {
          const labels: Record<string, string> = {
            validee: 'Validée',
            en_attente: 'En attente',
            rejetee: 'Rejetée',
          };
          return labels[row.statut] ?? row.statut;
        },
        badgeSeverity: (row) => {
          const map: Record<string, any> = {
            validee: 'success',
            en_attente: 'warn',
            rejetee: 'danger',
          };
          return map[row.statut];
        },
      },
      { field: 'createdAt', header: 'Date création', cellType: 'date' },
    ],
  };

  ngOnInit(): void {
    this.loadBoutiques();
  }

  loadBoutiques(): void {
    this.loading.set(true);
    this.boutiqueService.getAll().subscribe({
      next: (data) => {
        this.boutiques.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les boutiques',
        });
        this.loading.set(false);
      },
    });
  }
}
