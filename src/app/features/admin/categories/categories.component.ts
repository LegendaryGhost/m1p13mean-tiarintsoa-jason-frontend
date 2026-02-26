import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

import { CategorieBase } from '../../../core/models';
import { CategorieService } from '../../../core/services/categorie.service';

@Component({
  selector: 'app-categories',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    CardModule,
    ColorPickerModule,
    ConfirmDialogModule,
    DialogModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    TableModule,
    TagModule,
    TextareaModule,
    ToastModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent implements OnInit {
  private categorieService = inject(CategorieService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  categories = signal<CategorieBase[]>([]);
  loading = signal(false);
  dialogVisible = signal(false);
  saving = signal(false);
  editingId = signal<string | null>(null);

  isEditing = computed(() => this.editingId() !== null);

  form: FormGroup = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    icon: ['pi-tag', [Validators.required]],
    couleur: ['#1976D2', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
  });

  /** Common PrimeIcons available for categories */
  availableIcons: string[] = [
    'pi-tag',
    'pi-shopping-bag',
    'pi-shopping-cart',
    'pi-box',
    'pi-home',
    'pi-star',
    'pi-heart',
    'pi-bookmark',
    'pi-gift',
    'pi-desktop',
    'pi-mobile',
    'pi-camera',
    'pi-tablet',
    'pi-headphones',
    'pi-car',
    'pi-briefcase',
    'pi-palette',
    'pi-book',
    'pi-apple',
    'pi-coffee',
    'pi-building',
    'pi-map-marker',
    'pi-globe',
    'pi-image',
    'pi-user',
    'pi-users',
    'pi-chart-bar',
    'pi-bolt',
    'pi-sun',
    'pi-moon',
  ];

  /** Options for the icon p-select */
  iconOptions = this.availableIcons.map((icon) => ({
    label: icon.replace('pi-', ''),
    value: icon,
  }));

  /** Hex value fed into the colorpicker — reacts to text input changes */
  colorPickerValue = toSignal(
    this.form.get('couleur')!.valueChanges.pipe(
      startWith(this.form.get('couleur')!.value as string),
      map((val: string) => {
        if (!val || !/^#[0-9A-Fa-f]{6}$/i.test(val)) return '1976D2';
        return val.startsWith('#') ? val.slice(1) : val;
      }),
    ),
    { initialValue: '1976D2' },
  );

  /** Sync color picker -> hex text control */
  onColorPickerChange(hex: string) {
    const normalized = hex.startsWith('#') ? hex : `#${hex}`;
    this.form.get('couleur')?.setValue(normalized, { emitEvent: true });
    this.form.get('couleur')?.markAsDirty();
  }

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
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment supprimer la catégorie <strong>${categorie.nom}</strong> ? Cette action est irréversible.`,
      header: 'Confirmer la suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.categorieService.delete(categorie._id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Supprimé',
              detail: `La catégorie "${categorie.nom}" a été supprimée`,
            });
            this.loadCategories();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de supprimer cette catégorie',
            });
          },
        });
      },
    });
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getIconClass(icon: string): string {
    return icon.startsWith('pi ') ? icon : `pi ${icon}`;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }
}
