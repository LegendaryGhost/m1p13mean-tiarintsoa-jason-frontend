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
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { PageListLayoutComponent } from '../../../shared/components/page-list-layout/page-list-layout.component';

import { CategorieBase } from '../../../core/models';
import { CategorieService } from '../../../core/services/categorie.service';
import { GenericListComponent } from '../../../shared/components/generic-list/generic-list.component';
import { GenericFormDialogComponent } from '../../../shared/components/generic-form-dialog/generic-form-dialog.component';
import { GenericConfirmDialogComponent } from '../../../shared/components/generic-confirm-dialog/generic-confirm-dialog.component';
import { ListConfig } from '../../../shared/components/generic-list/generic-list.types';
import { FieldDef } from '../../../shared/components/generic-form-dialog/generic-form-dialog.types';

@Component({
  selector: 'app-categories',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    TagModule,
    GenericListComponent,
    PageListLayoutComponent,
    GenericFormDialogComponent,
    GenericConfirmDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent implements OnInit {
  private categorieService = inject(CategorieService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  categories = signal<CategorieBase[]>([]);
  loading = signal(false);
  dialogVisible = signal(false);
  saving = signal(false);
  editingId = signal<string | null>(null);

  deleteDialogVisible = signal(false);
  deletingCategorie = signal<CategorieBase | null>(null);
  deleting = signal(false);

  isEditing = computed(() => this.editingId() !== null);

  form: FormGroup = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    icon: ['pi-tag', [Validators.required]],
    couleur: ['#1976D2', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
  });

  /** Common PrimeIcons available for categories */
  private readonly availableIcons: string[] = [
    'pi-tag', 'pi-shopping-bag', 'pi-shopping-cart', 'pi-box', 'pi-home',
    'pi-star', 'pi-heart', 'pi-bookmark', 'pi-gift', 'pi-desktop',
    'pi-mobile', 'pi-camera', 'pi-tablet', 'pi-headphones', 'pi-car',
    'pi-briefcase', 'pi-palette', 'pi-book', 'pi-apple', 'pi-coffee',
    'pi-building', 'pi-map-marker', 'pi-globe', 'pi-image', 'pi-user',
    'pi-users', 'pi-chart-bar', 'pi-bolt', 'pi-sun', 'pi-moon',
  ];

  // ── List config ──────────────────────────────────────────────────
  listConfig: ListConfig<CategorieBase> = {
    paginator: true,
    rows: 10,
    rowsPerPageOptions: [10, 25, 50],
    emptyMessage: 'Aucune catégorie',
    emptyIcon: 'pi-list',
    columns: [
      {
        field: 'icon',
        header: 'Icône',
        cellType: 'icon',
        iconField: 'icon',
        colorField: 'couleur',
        width: '70px',
      },
      { field: 'nom', header: 'Nom', sortable: true, cellType: 'text' },
      { field: 'description', header: 'Description', cellType: 'text' },
      { field: 'couleur', header: 'Couleur', cellType: 'color', hexField: 'couleur', width: '160px' },
      { field: 'createdAt', header: 'Créée le', sortable: true, cellType: 'date' },
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
      placeholder: 'Ex. : Alimentaire',
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Description facultative de la catégorie',
      rows: 3,
    },
    {
      key: 'icon',
      label: 'Icône',
      type: 'select',
      required: true,
      placeholder: 'Choisir une icône',
      rowGroup: 'icon-color',
      options: this.availableIcons.map((icon) => ({
        label: icon.replace('pi-', ''),
        value: icon,
      })),
    },
    {
      key: 'couleur',
      label: 'Couleur',
      type: 'color',
      required: true,
      placeholder: '#1976D2',
      rowGroup: 'icon-color',
    },
  ];

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading.set(true);
    this.categorieService.getAll().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les catégories',
        });
        this.loading.set(false);
      },
    });
  }

  openCreateDialog() {
    this.editingId.set(null);
    this.form.reset({
      nom: '',
      description: '',
      icon: 'pi-tag',
      couleur: '#1976D2',
    });
    this.dialogVisible.set(true);
  }

  openEditDialog(categorie: CategorieBase) {
    this.editingId.set(categorie._id);
    this.form.reset({
      nom: categorie.nom,
      description: categorie.description ?? '',
      icon: categorie.icon ?? 'pi-tag',
      couleur: categorie.couleur ?? '#1976D2',
    });
    this.dialogVisible.set(true);
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.editingId.set(null);
    this.form.reset();
  }

  saveCategorie() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.value;
    this.saving.set(true);

    const id = this.editingId();
    const request$ = id
      ? this.categorieService.update(id, payload)
      : this.categorieService.create(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: id ? 'Catégorie mise à jour' : 'Catégorie créée',
        });
        this.saving.set(false);
        this.closeDialog();
        this.loadCategories();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: id
            ? 'Impossible de mettre à jour la catégorie'
            : 'Impossible de créer la catégorie',
        });
        this.saving.set(false);
      },
    });
  }

  confirmDelete(categorie: CategorieBase) {
    this.deletingCategorie.set(categorie);
    this.deleteDialogVisible.set(true);
    this.cdr.detectChanges();
  }

  cancelDelete() {
    this.deleteDialogVisible.set(false);
    this.deletingCategorie.set(null);
  }

  executeDelete() {
    const categorie = this.deletingCategorie();
    if (!categorie) return;

    this.deleting.set(true);
    this.categorieService.delete(categorie._id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Supprimé',
          detail: `La catégorie "${categorie.nom}" a été supprimée`,
        });
        this.deleting.set(false);
        this.cancelDelete();
        this.loadCategories();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de supprimer cette catégorie',
        });
        this.deleting.set(false);
      },
    });
  }

  getIconClass(icon: string | null | undefined): string {
    if (!icon) return 'pi pi-tag';
    return icon.startsWith('pi ') ? icon : `pi ${icon}`;
  }
}
