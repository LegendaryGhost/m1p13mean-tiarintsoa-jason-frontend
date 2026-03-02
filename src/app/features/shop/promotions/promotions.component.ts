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
import { CommonModule } from '@angular/common';

import { PageListLayoutComponent } from '../../../shared/components/page-list-layout/page-list-layout.component';
import { GenericListComponent } from '../../../shared/components/generic-list/generic-list.component';
import { GenericFormDialogComponent } from '../../../shared/components/generic-form-dialog/generic-form-dialog.component';
import { GenericConfirmDialogComponent } from '../../../shared/components/generic-confirm-dialog/generic-confirm-dialog.component';
import { ListConfig } from '../../../shared/components/generic-list/generic-list.types';
import { FieldDef } from '../../../shared/components/generic-form-dialog/generic-form-dialog.types';

import { PromotionPopulated, BoutiquePopulated } from '../../../core/models';
import { PromotionService } from '../../../core/services/promotion.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { environment } from '../../../../environments/environment';

type PromoStatus = 'active' | 'upcoming' | 'expired';

@Component({
  selector: 'app-promotions',
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
  templateUrl: './promotions.component.html',
  styleUrl: './promotions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionsComponent implements OnInit, AfterViewInit {
  @ViewChild('imageTpl') imageTpl!: TemplateRef<{ $implicit: PromotionPopulated }>;

  private promotionService = inject(PromotionService);
  private boutiqueService = inject(BoutiqueService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  // ── State signals ─────────────────────────────────────────────────────────
  promotions = signal<PromotionPopulated[]>([]);
  mesBoutiques = signal<BoutiquePopulated[]>([]);
  loading = signal(false);
  dialogVisible = signal(false);
  saving = signal(false);
  editingId = signal<string | null>(null);

  deleteDialogVisible = signal(false);
  deletingPromotion = signal<PromotionPopulated | null>(null);
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
      key: 'titre',
      label: 'Titre de la promotion',
      type: 'text',
      required: true,
      placeholder: "Ex. : Soldes d'été -30%",
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Description facultative de la promotion',
      rows: 3,
    },
    {
      key: 'dateDebut',
      label: 'Date de début',
      type: 'date',
      required: true,
      rowGroup: 'dates',
    },
    {
      key: 'dateFin',
      label: 'Date de fin',
      type: 'date',
      required: true,
      rowGroup: 'dates',
    },
    {
      key: 'reduction',
      label: 'Réduction (%)',
      type: 'number',
      min: 0,
      max: 100,
      step: 1,
      placeholder: 'Ex. : 20',
    },
  ]);

  // ── List config ───────────────────────────────────────────────────────────
  listConfig: ListConfig<PromotionPopulated> = {
    paginator: true,
    rows: 10,
    rowsPerPageOptions: [10, 25, 50],
    emptyMessage: 'Aucune promotion',
    emptyIcon: 'pi-tag',
    columns: [
      {
        field: 'image',
        header: 'Image',
        cellType: 'custom',
        width: '80px',
        // template is set in ngAfterViewInit
      },
      { field: 'titre', header: 'Titre', sortable: true, cellType: 'text' },
      {
        field: 'boutiqueId',
        header: 'Boutique',
        cellType: 'text',
        formatter: (row) => {
          const b = row.boutiqueId as any;
          return typeof b === 'object' && b !== null ? b.nom : b;
        },
      },
      { field: 'dateDebut', header: 'Début', sortable: true, cellType: 'date' },
      { field: 'dateFin', header: 'Fin', sortable: true, cellType: 'date' },
      {
        field: 'reduction',
        header: 'Réduction',
        cellType: 'text',
        formatter: (row) => (row.reduction != null ? `${row.reduction}%` : '-'),
      },
      {
        field: 'statut',
        header: 'Statut',
        cellType: 'badge',
        badgeValue: (row) => {
          const s = this.getPromoStatus(row);
          return s === 'active' ? 'Active' : s === 'upcoming' ? 'À venir' : 'Expirée';
        },
        badgeSeverity: (row) => {
          const s = this.getPromoStatus(row);
          return s === 'active' ? 'success' : s === 'upcoming' ? 'info' : 'secondary';
        },
      },
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

  // ── Form ──────────────────────────────────────────────────────────────────
  form: FormGroup = this.fb.group({
    boutiqueId: ['', [Validators.required]],
    titre: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    dateDebut: [null, [Validators.required]],
    dateFin: [null, [Validators.required]],
    reduction: [null],
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
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
    this.promotionService.getMesPromotions().subscribe({
      next: (promotions) => {
        this.promotions.set(promotions);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les promotions',
        });
        this.loading.set(false);
      },
    });
  }

  loadPromotions(): void {
    this.loading.set(true);
    this.promotionService.getMesPromotions().subscribe({
      next: (promotions) => {
        this.promotions.set(promotions);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les promotions',
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
    this.form.reset({ boutiqueId: '', titre: '', description: '', dateDebut: null, dateFin: null, reduction: null });
    this.dialogVisible.set(true);
  }

  openEditDialog(promotion: PromotionPopulated): void {
    this.editingId.set(promotion._id);
    this.selectedImageFile.set(null);
    this.imagePreviewUrl.set(null);
    this.existingImageUrl.set(promotion.image || null);

    const boutiqueId = typeof promotion.boutiqueId === 'object'
      ? (promotion.boutiqueId as any)._id
      : promotion.boutiqueId;

    const toDateInput = (d: Date | string | null): string | null => {
      if (!d) return null;
      return new Date(d).toISOString().substring(0, 10);
    };

    this.form.reset({
      boutiqueId,
      titre: promotion.titre,
      description: promotion.description ?? '',
      dateDebut: toDateInput(promotion.dateDebut),
      dateFin: toDateInput(promotion.dateFin),
      reduction: promotion.reduction ?? null,
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

  savePromotion(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const formData = new FormData();
    formData.append('boutiqueId', val.boutiqueId);
    formData.append('titre', val.titre);
    formData.append('description', val.description || '');
    formData.append('dateDebut', val.dateDebut);
    formData.append('dateFin', val.dateFin);
    if (val.reduction != null && val.reduction !== '') {
      formData.append('reduction', String(val.reduction));
    }

    const file = this.selectedImageFile();
    if (file) {
      formData.append('image', file);
    }

    this.saving.set(true);

    const id = this.editingId();
    const request$ = id
      ? this.promotionService.updateWithImage(id, formData)
      : this.promotionService.createWithImage(formData);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: id ? 'Promotion mise à jour' : 'Promotion créée',
        });
        this.saving.set(false);
        this.closeDialog();
        this.loadPromotions();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: id ? 'Impossible de mettre à jour la promotion' : 'Impossible de créer la promotion',
        });
        this.saving.set(false);
      },
    });
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  confirmDelete(promotion: PromotionPopulated): void {
    this.deletingPromotion.set(promotion);
    this.deleteDialogVisible.set(true);
    this.cdr.detectChanges();
  }

  cancelDelete(): void {
    this.deleteDialogVisible.set(false);
    this.deletingPromotion.set(null);
  }

  executeDelete(): void {
    const promotion = this.deletingPromotion();
    if (!promotion) return;

    this.deleting.set(true);
    this.promotionService.delete(promotion._id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Supprimé',
          detail: `La promotion "${promotion.titre}" a été supprimée`,
        });
        this.deleting.set(false);
        this.cancelDelete();
        this.loadPromotions();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de supprimer cette promotion',
        });
        this.deleting.set(false);
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getPromoStatus(promotion: PromotionPopulated): PromoStatus {
    const now = new Date();
    const start = new Date(promotion.dateDebut);
    const end = new Date(promotion.dateFin);
    if (now >= start && now <= end) return 'active';
    if (now < start) return 'upcoming';
    return 'expired';
  }

  getImageSrc(image: string | null | undefined): string {
    if (!image) return '';
    if (image.startsWith('http') || image.startsWith('/uploads')) return image;
    return `${environment.apiUrl.replace('/api', '')}${image}`;
  }
}
