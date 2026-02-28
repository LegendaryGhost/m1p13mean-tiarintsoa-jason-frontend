import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { DemandeBoutiquePopulated } from '../../../core/models/demande-boutique.model';
import { BoutiquePopulated } from '../../../core/models/boutique.model';
import { EmplacementPopulated } from '../../../core/models/emplacement.model';
import { DemandeBoutiqueService } from '../../../core/services/demande-boutique.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { EmplacementService } from '../../../core/services/emplacement.service';
import { GenericListComponent } from '../../../shared/components/generic-list/generic-list.component';
import { GenericFormDialogComponent } from '../../../shared/components/generic-form-dialog/generic-form-dialog.component';
import { ListConfig } from '../../../shared/components/generic-list/generic-list.types';
import { FieldDef } from '../../../shared/components/generic-form-dialog/generic-form-dialog.types';

@Component({
  selector: 'app-mes-demandes',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    ToastModule,
    GenericListComponent,
    GenericFormDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './mes-demandes.component.html',
  styleUrl: './mes-demandes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MesDemandesComponent implements OnInit {
  private demandeService = inject(DemandeBoutiqueService);
  private boutiqueService = inject(BoutiqueService);
  private emplacementService = inject(EmplacementService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  demandes = signal<DemandeBoutiquePopulated[]>([]);
  mesBoutiques = signal<BoutiquePopulated[]>([]);
  emplacementsLibres = signal<EmplacementPopulated[]>([]);
  loading = signal(false);
  dialogVisible = signal(false);
  saving = signal(false);

  form: FormGroup = this.fb.group({
    boutiqueId: ['', [Validators.required]],
    emplacementSouhaiteId: ['', [Validators.required]],
    dateDebutSouhaitee: ['', [Validators.required]],
    dateFinSouhaitee: [''],
  });

  // ── Form fields — set once when the dialog opens to avoid p-select resetting
  // its value when the options array reference changes reactively
  formFields = signal<FieldDef[]>([]);

  // ── List config ──────────────────────────────────────────────────────
  listConfig: ListConfig<DemandeBoutiquePopulated> = {
    paginator: true,
    rows: 10,
    rowsPerPageOptions: [10, 25, 50],
    emptyMessage: 'Aucune demande soumise',
    emptyIcon: 'pi-inbox',
    columns: [
      { field: 'boutiqueId.nom', header: 'Boutique', cellType: 'text', sortable: true },
      { field: 'emplacementSouhaiteId.numero', header: 'Emplacement', cellType: 'text' },
      { field: 'emplacementSouhaiteId.etageId.nom', header: 'Étage', cellType: 'text' },
      { field: 'dateDebutSouhaitee', header: 'Début souhaité', cellType: 'date', sortable: true },
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
      { field: 'createdAt', header: 'Date', sortable: true, cellType: 'date' },
      { field: 'motifRefus', header: 'Motif du refus', cellType: 'text' },
    ],
  };

  ngOnInit() {
    this.loadDemandes();
    this.loadEmplacementsLibres();
    this.loadMesBoutiques();
  }

  loadDemandes() {
    this.loading.set(true);
    this.demandeService.getMesDemandes().subscribe({
      next: (data) => {
        this.demandes.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger vos demandes',
        });
        this.loading.set(false);
      },
    });
  }

  loadMesBoutiques() {
    this.boutiqueService.getMesBoutiques().subscribe({
      next: (boutiques) => {
        // Only show validated shops for slot requests
        this.mesBoutiques.set(boutiques.filter((b) => b.statut === 'validee'));
      },
      error: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Avertissement',
          detail: 'Impossible de charger vos boutiques',
        });
      },
    });
  }

  loadEmplacementsLibres() {
    this.emplacementService.getDisponibles().subscribe({
      next: (data) => this.emplacementsLibres.set(data),
      error: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Avertissement',
          detail: 'Impossible de charger les emplacements disponibles',
        });
      },
    });
  }

  openCreateDialog() {
    // Snapshot options into a writable signal at open time to prevent p-select
    // from receiving a new array reference while the dialog is open, which would
    // reset its value and trigger spurious validation errors.
    this.formFields.set([
      {
        key: 'boutiqueId',
        label: 'Boutique',
        type: 'select',
        required: true,
        placeholder: 'Choisir une boutique',
        options: this.mesBoutiques().map((b) => ({
          label: b.nom,
          value: b._id,
        })),
      },
      {
        key: 'emplacementSouhaiteId',
        label: 'Emplacement souhaité',
        type: 'select',
        required: true,
        placeholder: 'Choisir un emplacement disponible',
        options: this.emplacementsLibres().map((e) => ({
          label: `${e.numero} — Étage ${(e.etageId as any)?.niveau ?? ''} ${(e.etageId as any)?.nom ? ' (' + (e.etageId as any).nom + ')' : ''}`.trim(),
          value: e._id,
        })),
      },
      {
        key: 'dateDebutSouhaitee',
        label: 'Date de début souhaitée',
        type: 'date',
        required: true,
        rowGroup: 'dates',
      },
      {
        key: 'dateFinSouhaitee',
        label: 'Date de fin souhaitée',
        type: 'date',
        rowGroup: 'dates',
      },
    ]);
    this.form.reset({
      boutiqueId: '',
      emplacementSouhaiteId: '',
      dateDebutSouhaitee: '',
      dateFinSouhaitee: '',
    });
    this.dialogVisible.set(true);
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.form.reset();
  }

  submitDemande() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const { boutiqueId, emplacementSouhaiteId, dateDebutSouhaitee, dateFinSouhaitee } =
      this.form.value;
    this.demandeService
      .createDemande({
        boutiqueId,
        emplacementSouhaiteId,
        dateDebutSouhaitee,
        ...(dateFinSouhaitee ? { dateFinSouhaitee } : {}),
      })
      .subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Demande soumise',
          detail: "Votre demande d'emplacement a été envoyée à l'administration",
        });
        this.saving.set(false);
        this.closeDialog();
        this.loadDemandes();
        this.loadEmplacementsLibres();
      },
      error: (err) => {
        const detail =
          err?.error?.message ?? 'Impossible de soumettre votre demande';
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail });
        this.saving.set(false);
      },
    });
  }
}
