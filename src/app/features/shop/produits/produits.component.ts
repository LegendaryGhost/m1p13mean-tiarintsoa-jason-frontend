import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';

import { PageListLayoutComponent } from '../../../shared/components/page-list-layout/page-list-layout.component';
import { GenericListComponent } from '../../../shared/components/generic-list/generic-list.component';
import { GenericFormDialogComponent } from '../../../shared/components/generic-form-dialog/generic-form-dialog.component';
import { GenericConfirmDialogComponent } from '../../../shared/components/generic-confirm-dialog/generic-confirm-dialog.component';
import { ListConfig } from '../../../shared/components/generic-list/generic-list.types';
import { FieldDef } from '../../../shared/components/generic-form-dialog/generic-form-dialog.types';

import { ProduitPopulated, BoutiquePopulated } from '../../../core/models';
import { ProduitService } from '../../../core/services/produit.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-produits',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    TagModule,
    GenericListComponent,
    PageListLayoutComponent,
    GenericFormDialogComponent,
    GenericConfirmDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './produits.component.html',
  styleUrl: './produits.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProduitsComponent implements OnInit, AfterViewInit {
  @ViewChild('imageTpl') imageTpl!: TemplateRef<{ $implicit: ProduitPopulated }>;

  private produitService = inject(ProduitService);
  private boutiqueService = inject(BoutiqueService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  // ── State signals ─────────────────────────────────────────────────────────
  produits = signal<ProduitPopulated[]>([]);
  mesBoutiques = signal<BoutiquePopulated[]>([]);
  loading = signal(false);
  dialogVisible = signal(false);
  saving = signal(false);
  editingId = signal<string | null>(null);

  deleteDialogVisible = signal(false);
  deletingProduit = signal<ProduitPopulated | null>(null);
  deleting = signal(false);

  selectedImageFile = signal<File | null>(null);
  imagePreviewUrl = signal<string | null>(null);
  existingImageUrl = signal<string | null>(null);

  // ── Computed ──────────────────────────────────────────────────────────────
  isEditing = computed(() => this.editingId() !== null);

  readonly formFields = computed<FieldDef[]>(() => [
    {
      key: 'boutiqueId',
      label: 'Boutique',
      type: 'select',
      required: true,
      placeholder: 'Choisir une boutique',
      options: this.mesBoutiques().map((b) => ({ label: b.nom, value: b._id })),
    },
    {
      key: 'nom',
      label: 'Nom du produit',
      type: 'text',
      required: true,
      placeholder: "Ex. : Robe d'été",
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Description facultative du produit',
      rows: 3,
    },
    {
      key: 'prix',
      label: 'Prix (MGA)',
      type: 'number',
      required: true,
      min: 0,
      step: 0.01,
      placeholder: '0.00',
    },
    {
      key: 'enAvant',
      label: 'Mettre en avant',
      type: 'checkbox',
    },
  ]);

  // ── List config ───────────────────────────────────────────────────────────
  listConfig: ListConfig<ProduitPopulated> = {
    paginator: true,
    rows: 10,
    rowsPerPageOptions: [10, 25, 50],
    emptyMessage: 'Aucun produit',
    emptyIcon: 'pi-box',
    columns: [
      {
        field: 'image',
        header: 'Image',
        cellType: 'custom',
        width: '80px',
        // template is set in ngAfterViewInit
      },
      { field: 'nom', header: 'Nom', sortable: true, cellType: 'text' },
      {
        field: 'boutiqueId',
        header: 'Boutique',
        cellType: 'text',
        formatter: (row) => {
          const b = row.boutiqueId as any;
          return typeof b === 'object' && b !== null ? b.nom : b;
        },
      },
      {
        field: 'prix',
        header: 'Prix',
        sortable: true,
        cellType: 'text',
        formatter: (row) =>
          row.prix != null
            ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA' }).format(row.prix)
            : '-',
      },
      {
        field: 'enAvant',
        header: 'Statut',
        cellType: 'badge',
        badgeValue: (row) => (row.enAvant ? 'En avant' : 'Standard'),
        badgeSeverity: (row) => (row.enAvant ? 'success' : 'secondary'),
      },
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

  // ── Form ──────────────────────────────────────────────────────────────────
  form: FormGroup = this.fb.group({
    boutiqueId: ['', [Validators.required]],
    nom: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    prix: [null, [Validators.required, Validators.min(0)]],
    enAvant: [false],
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Inject the image TemplateRef into the list config after the view is ready
    const imgCol = this.listConfig.columns.find((c) => c.field === 'image');
    if (imgCol) {
      imgCol.template = this.imageTpl;
    }
    this.cdr.detectChanges();
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  private loadData(): void {
    this.loading.set(true);
    this.boutiqueService.getMesBoutiques().subscribe({
      next: (boutiques) => this.mesBoutiques.set(boutiques),
      error: () => {},
    });
    this.produitService.getMesProduits().subscribe({
      next: (produits) => {
        this.produits.set(produits);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les produits',
        });
        this.loading.set(false);
      },
    });
  }

  loadProduits(): void {
    this.loading.set(true);
    this.produitService.getMesProduits().subscribe({
      next: (produits) => {
        this.produits.set(produits);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les produits',
        });
        this.loading.set(false);
      },
    });
  }

  // ── Dialog management ─────────────────────────────────────────────────────

  openCreateDialog(): void {
    this.editingId.set(null);
    this.selectedImageFile.set(null);
    this.imagePreviewUrl.set(null);
    this.existingImageUrl.set(null);
    this.form.reset({ boutiqueId: '', nom: '', description: '', prix: null, enAvant: false });
    this.dialogVisible.set(true);
  }

  openEditDialog(produit: ProduitPopulated): void {
    this.editingId.set(produit._id);
    this.selectedImageFile.set(null);
    this.imagePreviewUrl.set(null);
    this.existingImageUrl.set(produit.image || null);

    const boutiqueId = typeof produit.boutiqueId === 'object'
      ? (produit.boutiqueId as any)._id
      : produit.boutiqueId;

    this.form.reset({
      boutiqueId,
      nom: produit.nom,
      description: produit.description ?? '',
      prix: produit.prix,
      enAvant: produit.enAvant,
    });
    this.dialogVisible.set(true);
  }

  closeDialog(): void {
    this.dialogVisible.set(false);
    this.editingId.set(null);
    this.selectedImageFile.set(null);
    this.imagePreviewUrl.set(null);
    this.existingImageUrl.set(null);
    this.form.reset();
  }

  // ── Image selection ───────────────────────────────────────────────────────

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedImageFile.set(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviewUrl.set(e.target?.result as string);
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    } else {
      this.imagePreviewUrl.set(null);
    }
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  saveProduit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const formData = new FormData();
    formData.append('boutiqueId', val.boutiqueId);
    formData.append('nom', val.nom);
    formData.append('description', val.description || '');
    formData.append('prix', String(val.prix));
    formData.append('enAvant', String(val.enAvant || false));

    const file = this.selectedImageFile();
    if (file) {
      formData.append('image', file);
    }

    this.saving.set(true);

    const id = this.editingId();
    const request$ = id
      ? this.produitService.updateWithImage(id, formData)
      : this.produitService.createWithImage(formData);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: id ? 'Produit mis à jour' : 'Produit créé',
        });
        this.saving.set(false);
        this.closeDialog();
        this.loadProduits();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: id ? 'Impossible de mettre à jour le produit' : 'Impossible de créer le produit',
        });
        this.saving.set(false);
      },
    });
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  confirmDelete(produit: ProduitPopulated): void {
    this.deletingProduit.set(produit);
    this.deleteDialogVisible.set(true);
    this.cdr.detectChanges();
  }

  cancelDelete(): void {
    this.deleteDialogVisible.set(false);
    this.deletingProduit.set(null);
  }

  executeDelete(): void {
    const produit = this.deletingProduit();
    if (!produit) return;

    this.deleting.set(true);
    this.produitService.delete(produit._id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Supprimé',
          detail: `Le produit "${produit.nom}" a été supprimé`,
        });
        this.deleting.set(false);
        this.cancelDelete();
        this.loadProduits();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de supprimer ce produit',
        });
        this.deleting.set(false);
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getImageSrc(image: string | null | undefined): string {
    if (!image) return '';
    if (image.startsWith('http') || image.startsWith('/uploads')) return image;
    return `${environment.apiUrl.replace('/api', '')}${image}`;
  }
}
