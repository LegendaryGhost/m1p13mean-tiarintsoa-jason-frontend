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
import { MessageService } from 'primeng/api';
import { PageListLayoutComponent } from '../../../shared/components/page-list-layout/page-list-layout.component';

import { BoutiquePopulated } from '../../../core/models/boutique.model';
import { CategorieBase } from '../../../core/models/categorie.model';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { CategorieService } from '../../../core/services/categorie.service';
import { GenericListComponent } from '../../../shared/components/generic-list/generic-list.component';
import { GenericFormDialogComponent } from '../../../shared/components/generic-form-dialog/generic-form-dialog.component';
import { ListConfig } from '../../../shared/components/generic-list/generic-list.types';
import { FieldDef } from '../../../shared/components/generic-form-dialog/generic-form-dialog.types';

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const;

@Component({
  selector: 'app-mes-boutiques',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    GenericListComponent,
    PageListLayoutComponent,
    GenericFormDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './mes-boutiques.component.html',
  styleUrl: './mes-boutiques.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MesBoutiquesComponent implements OnInit {
  private boutiqueService = inject(BoutiqueService);
  private categorieService = inject(CategorieService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  boutiques = signal<BoutiquePopulated[]>([]);
  categories = signal<CategorieBase[]>([]);
  loading = signal(false);
  dialogVisible = signal(false);
  saving = signal(false);

  /** ID of the boutique currently being edited; null when none is open */
  editingId = signal<string | null>(null);
  isEditing = computed(() => this.editingId() !== null);

  form: FormGroup = this.fb.group({
    nom: ['', [Validators.required]],
    categorieId: ['', [Validators.required]],
    heureOuverture: ['', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    heureFermeture: ['', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
    description: [''],
    logo: [''],
    // Day-of-week checkboxes — converted to joursOuverture[] on submit
    lundi: [false],
    mardi: [false],
    mercredi: [false],
    jeudi: [false],
    vendredi: [false],
    samedi: [false],
    dimanche: [false],
  });

  /** Form fields snapshot — set once when the dialog opens */
  formFields = signal<FieldDef[]>([]);

  // ── List config ──────────────────────────────────────────────────────
  listConfig: ListConfig<BoutiquePopulated> = {
    paginator: true,
    rows: 10,
    rowsPerPageOptions: [10, 25, 50],
    emptyMessage: 'Aucune boutique enregistrée',
    emptyIcon: 'pi-shop',
    columns: [
      { field: 'nom', header: 'Boutique', cellType: 'text', sortable: true },
      { field: 'categorieId.nom', header: 'Catégorie', cellType: 'text' },
      { field: 'heureOuverture', header: 'Ouverture', cellType: 'text' },
      { field: 'heureFermeture', header: 'Fermeture', cellType: 'text' },
      {
        field: 'joursOuverture',
        header: 'Jours d\'ouverture',
        cellType: 'text',
        formatter: (row: BoutiquePopulated) =>
          (row.joursOuverture ?? []).map((j) => j.charAt(0).toUpperCase() + j.slice(1, 3) + '.').join(' ') || '—',
      },
      { field: 'createdAt', header: 'Date de création', cellType: 'date', sortable: true },
    ],
    actions: [
      {
        icon: 'pi-pencil',
        tooltip: 'Modifier',
        action: (row) => this.openEditDialog(row),
      },
    ],
  };

  ngOnInit() {
    this.loadBoutiques();
    this.loadCategories();
  }

  loadBoutiques() {
    this.loading.set(true);
    this.boutiqueService.getMesBoutiques().subscribe({
      next: (data) => {
        this.boutiques.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger vos boutiques',
        });
        this.loading.set(false);
      },
    });
  }

  loadCategories() {
    this.categorieService.getAll().subscribe({
      next: (data) => this.categories.set(data),
      error: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Avertissement',
          detail: 'Impossible de charger les catégories',
        });
      },
    });
  }

  // ── Shared field-definition builder ─────────────────────────────────
  private buildFormFields(): FieldDef[] {
    return [
      {
        key: 'nom',
        label: 'Nom de la boutique',
        type: 'text',
        required: true,
        placeholder: 'Ex\u00a0: Ma Boutique',
      },
      {
        key: 'categorieId',
        label: 'Catégorie',
        type: 'select',
        required: true,
        placeholder: 'Choisir une catégorie',
        options: this.categories().map((c) => ({ label: c.nom, value: c._id })),
      },
      {
        key: 'heureOuverture',
        label: "Heure d'ouverture",
        type: 'text',
        required: true,
        placeholder: 'HH:MM',
        rowGroup: 'horaires',
      },
      {
        key: 'heureFermeture',
        label: 'Heure de fermeture',
        type: 'text',
        required: true,
        placeholder: 'HH:MM',
        rowGroup: 'horaires',
      },
      { key: '_jours_label', label: 'Jours d\'ouverture', type: 'label' },
      { key: 'lundi',    label: 'Lundi',    type: 'checkbox', rowGroup: 'jours1' },
      { key: 'mardi',    label: 'Mardi',    type: 'checkbox', rowGroup: 'jours1' },
      { key: 'mercredi', label: 'Mercredi', type: 'checkbox', rowGroup: 'jours1' },
      { key: 'jeudi',    label: 'Jeudi',    type: 'checkbox', rowGroup: 'jours1' },
      { key: 'vendredi', label: 'Vendredi', type: 'checkbox', rowGroup: 'jours2' },
      { key: 'samedi',   label: 'Samedi',   type: 'checkbox', rowGroup: 'jours2' },
      { key: 'dimanche', label: 'Dimanche', type: 'checkbox', rowGroup: 'jours2' },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        rows: 3,
        placeholder: 'Décrivez votre boutique…',
      },
      {
        key: 'logo',
        label: 'Logo (URL)',
        type: 'text',
        placeholder: 'https://example.com/logo.png',
      },
    ];
  }

  // ── Dialog: edit an existing boutique ───────────────────────────────
  openEditDialog(boutique: BoutiquePopulated) {
    this.editingId.set(boutique._id);
    this.formFields.set(this.buildFormFields());

    // Populate form with existing data
    const catId = typeof boutique.categorieId === 'object' && boutique.categorieId !== null
      ? (boutique.categorieId as any)._id
      : boutique.categorieId;

    const joursMap: Record<string, boolean> = {};
    JOURS.forEach((j) => (joursMap[j] = (boutique.joursOuverture ?? []).includes(j)));

    this.form.reset({
      nom: boutique.nom ?? '',
      categorieId: catId ?? '',
      heureOuverture: boutique.heureOuverture ?? '',
      heureFermeture: boutique.heureFermeture ?? '',
      description: boutique.description ?? '',
      logo: boutique.logo ?? '',
      ...joursMap,
    });

    this.dialogVisible.set(true);
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.editingId.set(null);
    this.form.reset();
  }

  submitBoutique() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const joursOuverture = JOURS.filter((j) => v[j]);

    const payload = {
      nom: v.nom,
      categorieId: v.categorieId,
      heureOuverture: v.heureOuverture,
      heureFermeture: v.heureFermeture,
      joursOuverture,
      ...(v.description ? { description: v.description } : {}),
      ...(v.logo ? { logo: v.logo } : {}),
    };

    this.saving.set(true);

    const id = this.editingId();
    const request$ = id
      ? this.boutiqueService.updateMaBoutique(id, payload)
      : this.boutiqueService.createMaBoutique(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: id ? 'Boutique modifiée' : 'Boutique ajoutée',
          detail: id
            ? 'Les informations de votre boutique ont été mises à jour'
            : 'Votre boutique a été soumise et est en attente de validation',
        });
        this.saving.set(false);
        this.closeDialog();
        this.loadBoutiques();
      },
      error: (err) => {
        const detail = err?.error?.message ?? (id ? 'Impossible de modifier votre boutique' : 'Impossible de créer votre boutique');
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail });
        this.saving.set(false);
      },
    });
  }
}
