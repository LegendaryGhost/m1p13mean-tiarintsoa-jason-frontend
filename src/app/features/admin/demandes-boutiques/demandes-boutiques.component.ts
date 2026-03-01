import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { PageListLayoutComponent } from '../../../shared/components/page-list-layout/page-list-layout.component';

import { DemandeBoutiquePopulated } from '../../../core/models/demande-boutique.model';
import { DemandeBoutiqueService } from '../../../core/services/demande-boutique.service';
import { GenericListComponent } from '../../../shared/components/generic-list/generic-list.component';
import { GenericFormDialogComponent } from '../../../shared/components/generic-form-dialog/generic-form-dialog.component';
import { GenericConfirmDialogComponent } from '../../../shared/components/generic-confirm-dialog/generic-confirm-dialog.component';
import { ListConfig } from '../../../shared/components/generic-list/generic-list.types';
import { FieldDef } from '../../../shared/components/generic-form-dialog/generic-form-dialog.types';

@Component({
  selector: 'app-demandes-boutiques',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    GenericListComponent,
    PageListLayoutComponent,
    GenericFormDialogComponent,
    GenericConfirmDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './demandes-boutiques.component.html',
  styleUrl: './demandes-boutiques.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemandesBoutiquesComponent implements OnInit {
  private demandeService = inject(DemandeBoutiqueService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  demandes = signal<DemandeBoutiquePopulated[]>([]);
  loading = signal(false);

  // ── Accept dialog ────────────────────────────────────────
  acceptDialogVisible = signal(false);
  acceptingDemande = signal<DemandeBoutiquePopulated | null>(null);
  accepting = signal(false);

  // ── Reject dialog ────────────────────────────────────────
  rejectDialogVisible = signal(false);
  rejectingDemande = signal<DemandeBoutiquePopulated | null>(null);
  rejecting = signal(false);

  rejectForm: FormGroup = this.fb.group({
    motifRefus: ['', [Validators.required, Validators.minLength(5)]],
  });

  // ── List config ──────────────────────────────────────────
  listConfig: ListConfig<DemandeBoutiquePopulated> = {
    paginator: true,
    rows: 10,
    rowsPerPageOptions: [10, 25, 50],
    emptyMessage: 'Aucune demande',
    emptyIcon: 'pi-inbox',
    columns: [
      { field: 'nomBoutique', header: 'Boutique demandée', cellType: 'text', sortable: true },
      { field: 'categorieId.nom', header: 'Catégorie', cellType: 'text' },
      { field: 'emplacementSouhaiteId.numero', header: 'Emplacement', cellType: 'text' },
      { field: 'emplacementSouhaiteId.etageId.nom', header: 'Étage', cellType: 'text' },
      { field: 'dateDebutSouhaitee', header: 'Début souhaité', cellType: 'date', sortable: true },
      { field: 'dateFinSouhaitee', header: 'Fin souhaitée', cellType: 'date' },
      {
        field: 'statut',
        header: 'Statut',
        cellType: 'badge',
        sortable: true,
        badgeValue: (row) => {
          const labels: Record<string, string> = {
            en_attente: 'En attente',
            acceptee: 'Acceptée',
            refusee: 'Refusée',
          };
          return labels[row.statut] ?? row.statut;
        },
        badgeSeverity: (row) => {
          const map: Record<string, 'warn' | 'success' | 'danger'> = {
            en_attente: 'warn',
            acceptee: 'success',
            refusee: 'danger',
          };
          return map[row.statut];
        },
      },
      { field: 'createdAt', header: 'Soumise le', sortable: true, cellType: 'date' },
      { field: 'motifRefus', header: 'Motif du refus', cellType: 'text' },
    ],
    actions: [
      {
        icon: 'pi-check',
        severity: 'success',
        tooltip: 'Accepter',
        visible: (row) => row.statut === 'en_attente',
        action: (row) => this.openAcceptDialog(row),
      },
      {
        icon: 'pi-times',
        severity: 'danger',
        tooltip: 'Refuser',
        visible: (row) => row.statut === 'en_attente',
        action: (row) => this.openRejectDialog(row),
      },
    ],
  };

  // ── Reject form fields ───────────────────────────────────
  rejectFields: FieldDef[] = [
    {
      key: 'motifRefus',
      label: 'Motif du refus',
      type: 'textarea',
      required: true,
      placeholder: 'Expliquez la raison du refus...',
      rows: 4,
    },
  ];

  ngOnInit() {
    this.loadDemandes();
  }

  loadDemandes() {
    this.loading.set(true);
    this.demandeService.getAll().subscribe({
      next: (data) => {
        this.demandes.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les demandes',
        });
        this.loading.set(false);
      },
    });
  }

  // ── Accept flow ──────────────────────────────────────────
  openAcceptDialog(demande: DemandeBoutiquePopulated) {
    this.acceptingDemande.set(demande);
    this.acceptDialogVisible.set(true);
    this.cdr.detectChanges();
  }

  cancelAccept() {
    this.acceptDialogVisible.set(false);
    this.acceptingDemande.set(null);
  }

  executeAccept() {
    const demande = this.acceptingDemande();
    if (!demande) return;

    this.accepting.set(true);
    this.demandeService.updateStatut(demande._id, 'acceptee').subscribe({
      next: () => {
        const boutiqueName = demande.nomBoutique;
        this.messageService.add({
          severity: 'success',
          summary: 'Demande acceptée',
          detail: `La demande de ${boutiqueName} a été acceptée et l'emplacement assigné`,
        });
        this.accepting.set(false);
        this.cancelAccept();
        this.loadDemandes();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de traiter la demande',
        });
        this.accepting.set(false);
      },
    });
  }

  // ── Reject flow ──────────────────────────────────────────
  openRejectDialog(demande: DemandeBoutiquePopulated) {
    this.rejectingDemande.set(demande);
    this.rejectForm.reset({ motifRefus: '' });
    this.rejectDialogVisible.set(true);
    this.cdr.detectChanges();
  }

  cancelReject() {
    this.rejectDialogVisible.set(false);
    this.rejectingDemande.set(null);
    this.rejectForm.reset();
  }

  executeReject() {
    if (this.rejectForm.invalid) {
      this.rejectForm.markAllAsTouched();
      return;
    }

    const demande = this.rejectingDemande();
    if (!demande) return;

    this.rejecting.set(true);
    const motifRefus = this.rejectForm.value.motifRefus;

    this.demandeService.updateStatut(demande._id, 'refusee', motifRefus).subscribe({
      next: () => {
        const boutiqueName = demande.nomBoutique;
        this.messageService.add({
          severity: 'info',
          summary: 'Demande refusée',
          detail: `La demande de ${boutiqueName} a été refusée`,
        });
        this.rejecting.set(false);
        this.cancelReject();
        this.loadDemandes();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de refuser la demande',
        });
        this.rejecting.set(false);
      },
    });
  }

  get acceptMessage(): string {
    const d = this.acceptingDemande();
    if (!d) return '';
    const boutique = d.nomBoutique;
    const emplacement = (d.emplacementSouhaiteId as any)?.numero ?? 'cet emplacement';
    const debut = d.dateDebutSouhaitee
      ? new Date(d.dateDebutSouhaitee).toLocaleDateString('fr-FR')
      : null;
    const fin = d.dateFinSouhaitee
      ? new Date(d.dateFinSouhaitee).toLocaleDateString('fr-FR')
      : null;
    const periode = debut
      ? `<br>Période souhaitée\u00a0: <strong>${debut}</strong>${fin ? ' → ' + fin : ' (indéterminée)'}`
      : '';
    return `Accepter la demande de <strong>${boutique}</strong> pour l'emplacement <strong>${emplacement}</strong> ?${periode}<br><br>La boutique et l'assignation d'emplacement seront créées automatiquement.`;
  }
}
