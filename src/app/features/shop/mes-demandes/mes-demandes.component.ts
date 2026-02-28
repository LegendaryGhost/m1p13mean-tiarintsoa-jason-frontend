import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { DemandeBoutiquePopulated } from '../../../core/models/demande-boutique.model';
import { EmplacementPopulated } from '../../../core/models/emplacement.model';
import { DemandeBoutiqueService } from '../../../core/services/demande-boutique.service';
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
    TooltipModule,
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
  private emplacementService = inject(EmplacementService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  demandes = signal<DemandeBoutiquePopulated[]>([]);
  emplacementsLibres = signal<EmplacementPopulated[]>([]);
  loading = signal(false);
  dialogVisible = signal(false);
  saving = signal(false);

  /** True when there is already a pending request — prevents creating a new one */
  hasPendingRequest = computed(() =>
    this.demandes().some((d) => d.statut === 'en_attente')
  );

  form: FormGroup = this.fb.group({
    emplacementSouhaiteId: ['', [Validators.required]],
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
      { field: 'emplacementSouhaiteId.numero', header: 'Emplacement', cellType: 'text' },
      { field: 'emplacementSouhaiteId.etageId.nom', header: 'Étage', cellType: 'text' },
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
    // Snapshot the current libre emplacements into the field options at open time.
    // Using a writable signal (not computed) prevents p-select from receiving a
    // new options array while the dialog is open, which would reset its value
    // and trigger a false "required" validation error.
    this.formFields.set([
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
    ]);
    this.form.reset({ emplacementSouhaiteId: '' });
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
    this.demandeService.createDemande(this.form.value).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Demande soumise',
          detail: 'Votre demande d\'emplacement a été envoyée à l\'administration',
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
