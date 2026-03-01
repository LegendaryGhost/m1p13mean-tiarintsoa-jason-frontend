import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { PageListLayoutComponent } from '../../../shared/components/page-list-layout/page-list-layout.component';
import { GenericListComponent } from '../../../shared/components/generic-list/generic-list.component';
import { GenericFormDialogComponent } from '../../../shared/components/generic-form-dialog/generic-form-dialog.component';
import { GenericConfirmDialogComponent } from '../../../shared/components/generic-confirm-dialog/generic-confirm-dialog.component';
import { ListConfig } from '../../../shared/components/generic-list/generic-list.types';
import { FieldDef } from '../../../shared/components/generic-form-dialog/generic-form-dialog.types';

import { EtageBase } from '../../../core/models';
import { EtageService } from '../../../core/services/etage.service';

@Component({
  selector: 'app-etages',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    GenericListComponent,
    PageListLayoutComponent,
    GenericFormDialogComponent,
    GenericConfirmDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './etages.component.html',
  styleUrl: './etages.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EtagesComponent implements OnInit {
  private etageService = inject(EtageService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  etages = signal<EtageBase[]>([]);
  loading = signal(false);
  dialogVisible = signal(false);
  saving = signal(false);
  editingId = signal<string | null>(null);

  deleteDialogVisible = signal(false);
  deletingEtage = signal<EtageBase | null>(null);
  deleting = signal(false);

  isEditing = computed(() => this.editingId() !== null);

  form: FormGroup = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    niveau: [null, [Validators.required, Validators.min(-10), Validators.max(100)]],
    planImage: [''],
  });

  // ── List config ──────────────────────────────────────────────────
  listConfig: ListConfig<EtageBase> = {
    paginator: true,
    rows: 10,
    rowsPerPageOptions: [10, 25, 50],
    emptyMessage: 'Aucun étage',
    emptyIcon: 'pi-building',
    columns: [
      { field: 'niveau', header: 'Niveau', sortable: true, cellType: 'text', width: '120px' },
      { field: 'nom', header: 'Nom', sortable: true, cellType: 'text' },
      { field: 'planImage', header: 'Plan (URL)', cellType: 'text' },
      { field: 'createdAt', header: 'Créé le', sortable: true, cellType: 'date' },
    ],
    actions: [
      {
        icon: 'pi-pencil',
        tooltip: 'Modifier',
        action: (row) => this.openEditDialog(row),
      },
      {
        icon: 'pi-trash',
        severity: 'danger',
        tooltip: 'Supprimer',
        action: (row) => this.confirmDelete(row),
      },
    ],
  };

  // ── Form fields config ───────────────────────────────────────────
  formFields: FieldDef[] = [
    {
      key: 'nom',
      label: 'Nom',
      type: 'text',
      required: true,
      placeholder: 'Ex. : Rez-de-chaussée',
    },
    {
      key: 'niveau',
      label: 'Niveau',
      type: 'number',
      required: true,
      placeholder: 'Ex. : 0',
    },
    {
      key: 'planImage',
      label: 'Image du plan (URL)',
      type: 'text',
      placeholder: 'https://exemple.com/plan.png',
    },
  ];

  ngOnInit() {
    this.loadEtages();
  }

  loadEtages() {
    this.loading.set(true);
    this.etageService.getAll().subscribe({
      next: (data) => {
        this.etages.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les étages',
        });
        this.loading.set(false);
      },
    });
  }

  openCreateDialog() {
    this.editingId.set(null);
    this.form.reset({ nom: '', niveau: null, planImage: '' });
    this.dialogVisible.set(true);
  }

  openEditDialog(etage: EtageBase) {
    this.editingId.set(etage._id);
    this.form.reset({
      nom: etage.nom,
      niveau: etage.niveau,
      planImage: etage.planImage ?? '',
    });
    this.dialogVisible.set(true);
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.editingId.set(null);
    this.form.reset();
  }

  saveEtage() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.value;
    this.saving.set(true);

    const id = this.editingId();
    const request$ = id
      ? this.etageService.update(id, payload)
      : this.etageService.create(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: id ? 'Étage mis à jour' : 'Étage créé',
        });
        this.saving.set(false);
        this.closeDialog();
        this.loadEtages();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: id ? 'Impossible de mettre à jour l\'étage' : 'Impossible de créer l\'étage',
        });
        this.saving.set(false);
      },
    });
  }

  confirmDelete(etage: EtageBase) {
    this.deletingEtage.set(etage);
    this.deleteDialogVisible.set(true);
    this.cdr.detectChanges();
  }

  cancelDelete() {
    this.deleteDialogVisible.set(false);
    this.deletingEtage.set(null);
  }

  executeDelete() {
    const etage = this.deletingEtage();
    if (!etage) return;

    this.deleting.set(true);
    this.etageService.delete(etage._id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Supprimé',
          detail: `L'étage "${etage.nom}" a été supprimé`,
        });
        this.deleting.set(false);
        this.cancelDelete();
        this.loadEtages();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de supprimer cet étage',
        });
        this.deleting.set(false);
      },
    });
  }
}
