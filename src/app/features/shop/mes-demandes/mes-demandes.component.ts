import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { PageListLayoutComponent } from '../../../shared/components/page-list-layout/page-list-layout.component';

import { DemandeBoutiquePopulated } from '../../../core/models/demande-boutique.model';
import { BoutiquePopulated } from '../../../core/models/boutique.model';
import { CategorieBase } from '../../../core/models/categorie.model';
import { EmplacementPopulated } from '../../../core/models/emplacement.model';
import { DemandeBoutiqueService } from '../../../core/services/demande-boutique.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { CategorieService } from '../../../core/services/categorie.service';
import { EmplacementService } from '../../../core/services/emplacement.service';
import { GenericListComponent } from '../../../shared/components/generic-list/generic-list.component';
import { GenericFormDialogComponent } from '../../../shared/components/generic-form-dialog/generic-form-dialog.component';
import { ListConfig } from '../../../shared/components/generic-list/generic-list.types';
import { FieldDef, StepDef } from '../../../shared/components/generic-form-dialog/generic-form-dialog.types';

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const;
const TIME_PATTERN = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Logical step constants.
 * 0 → pick existing vs new shop
 * 1 → new shop details (skipped when existing is chosen)
 * 2 → rental details (emplacement + dates)
 */
const STEP_SOURCE = 0;
const STEP_SHOP   = 1;
const STEP_RENTAL = 2;

/** Step indicator labels for each mode */
const STEPS_NEW: StepDef[]      = [{ label: 'Boutique' }, { label: 'Infos boutique' }, { label: 'Location' }];
const STEPS_EXISTING: StepDef[] = [{ label: 'Boutique' }, { label: 'Location' }];

@Component({
  selector: 'app-mes-demandes',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    GenericListComponent,
    PageListLayoutComponent,
    GenericFormDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './mes-demandes.component.html',
  styleUrl: './mes-demandes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MesDemandesComponent implements OnInit {
  private demandeService     = inject(DemandeBoutiqueService);
  private boutiqueService    = inject(BoutiqueService);
  private categorieService   = inject(CategorieService);
  private emplacementService = inject(EmplacementService);
  private messageService     = inject(MessageService);
  private destroyRef         = inject(DestroyRef);
  private fb = inject(FormBuilder);

  demandes           = signal<DemandeBoutiquePopulated[]>([]);
  mesBoutiques       = signal<BoutiquePopulated[]>([]);
  categories         = signal<CategorieBase[]>([]);
  emplacementsLibres = signal<EmplacementPopulated[]>([]);
  loading       = signal(false);
  dialogVisible = signal(false);
  saving        = signal(false);

  /** Logical step index (0 = source, 1 = shop, 2 = rental) */
  currentStepIndex = signal(STEP_SOURCE);

  /** 'new' | 'existing' — kept in sync with the form control */
  shopMode = signal<'new' | 'existing'>('new');

  /** Step labels for the dialog indicator */
  steps = computed<StepDef[]>(() =>
    this.shopMode() === 'existing' ? STEPS_EXISTING : STEPS_NEW
  );

  /**
   * Converts logical step → visual index for the dialog step indicator.
   * existing: [SOURCE=0, RENTAL=1]   (step 1 is skipped visually)
   * new:      [SOURCE=0, SHOP=1, RENTAL=2]
   */
  visualStepIndex = computed<number>(() => {
    const logical = this.currentStepIndex();
    if (this.shopMode() === 'existing') {
      return logical === STEP_RENTAL ? 1 : 0;
    }
    return logical; // same as visual for full flow
  });

  // ── Form ────────────────────────────────────────────────────────────────────
  form: FormGroup = this.fb.group({
    // Step 0
    shopMode:            ['new'],
    boutiqueExistanteId: [''],
    // Step 1 — validators are set/cleared dynamically based on shopMode
    nomBoutique:    [''],
    categorieId:    [''],
    heureOuverture: ['', [Validators.pattern(TIME_PATTERN)]],
    heureFermeture: ['', [Validators.pattern(TIME_PATTERN)]],
    description:    [''],
    logo:           [''],
    lundi: [false], mardi: [false], mercredi: [false], jeudi: [false],
    vendredi: [false], samedi: [false], dimanche: [false],
    // Step 2
    emplacementSouhaiteId: ['', [Validators.required]],
    dateDebutSouhaitee:    ['', [Validators.required]],
    dateFinSouhaitee:      [''],
  });

  /** Fields passed to the dialog — refreshed each time the step or mode changes */
  formFields = signal<FieldDef[]>([]);

  // ── List config ──────────────────────────────────────────────────────────────
  listConfig: ListConfig<DemandeBoutiquePopulated> = {
    paginator: true,
    rows: 10,
    rowsPerPageOptions: [10, 25, 50],
    emptyMessage: 'Aucune demande soumise',
    emptyIcon: 'pi-inbox',
    columns: [
      { field: 'nomBoutique', header: 'Boutique demandée', cellType: 'text', sortable: true },
      { field: 'categorieId.nom', header: 'Catégorie', cellType: 'text' },
      { field: 'emplacementSouhaiteId.numero', header: 'Emplacement', cellType: 'text' },
      { field: 'emplacementSouhaiteId.etageId.nom', header: 'Étage', cellType: 'text' },
      { field: 'dateDebutSouhaitee', header: 'Début souhaité', cellType: 'date', sortable: true },
      {
        field: 'statut',
        header: 'Statut',
        cellType: 'badge',
        sortable: true,
        badgeValue: (row) => ({ en_attente: 'En attente', acceptee: 'Acceptée', refusee: 'Refusée' }[row.statut] ?? row.statut),
        badgeSeverity: (row) => ({ en_attente: 'warn' as const, acceptee: 'success' as const, refusee: 'danger' as const }[row.statut]),
      },
      { field: 'createdAt', header: 'Date', sortable: true, cellType: 'date' },
      { field: 'motifRefus', header: 'Motif du refus', cellType: 'text' },
    ],
  };

  // ── Lifecycle ────────────────────────────────────────────────────────────────
  ngOnInit() {
    this.loadDemandes();
    this.loadMesBoutiques();
    this.loadCategories();
    this.loadEmplacementsLibres();

    // Keep shopMode signal in sync with the radio form control
    this.form.get('shopMode')!.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((mode: 'new' | 'existing') => {
        if (mode !== 'new' && mode !== 'existing') return;
        this.shopMode.set(mode);
        this.applyValidatorsForMode(mode);
        // Refresh fields so the boutiqueExistanteId select appears/disappears
        this.formFields.set(this.buildFieldsForStep(this.currentStepIndex(), mode));
      });
  }

  loadDemandes() {
    this.loading.set(true);
    this.demandeService.getMesDemandes().subscribe({
      next: (data) => { this.demandes.set(data); this.loading.set(false); },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger vos demandes' });
        this.loading.set(false);
      },
    });
  }

  loadMesBoutiques() {
    this.boutiqueService.getMesBoutiques().subscribe({
      next: (data) => this.mesBoutiques.set(data),
      error: () => {},
    });
  }

  loadCategories() {
    this.categorieService.getAll().subscribe({
      next: (data) => this.categories.set(data),
      error: () => this.messageService.add({ severity: 'warn', summary: 'Avertissement', detail: 'Impossible de charger les catégories' }),
    });
  }

  loadEmplacementsLibres() {
    this.emplacementService.getDisponibles().subscribe({
      next: (data) => this.emplacementsLibres.set(data),
      error: () => this.messageService.add({ severity: 'warn', summary: 'Avertissement', detail: 'Impossible de charger les emplacements disponibles' }),
    });
  }

  // ── Validators ───────────────────────────────────────────────────────────────
  private applyValidatorsForMode(mode: 'new' | 'existing') {
    if (mode === 'new') {
      this.form.get('nomBoutique')?.setValidators([Validators.required]);
      this.form.get('categorieId')?.setValidators([Validators.required]);
      this.form.get('heureOuverture')?.setValidators([Validators.required, Validators.pattern(TIME_PATTERN)]);
      this.form.get('heureFermeture')?.setValidators([Validators.required, Validators.pattern(TIME_PATTERN)]);
      this.form.get('boutiqueExistanteId')?.clearValidators();
    } else {
      ['nomBoutique', 'categorieId', 'heureOuverture', 'heureFermeture'].forEach((k) =>
        this.form.get(k)?.clearValidators()
      );
      this.form.get('boutiqueExistanteId')?.setValidators([Validators.required]);
    }
    ['nomBoutique', 'categorieId', 'heureOuverture', 'heureFermeture', 'boutiqueExistanteId']
      .forEach((k) => this.form.get(k)?.updateValueAndValidity({ emitEvent: false }));
  }

  // ── Field definitions (built per-step) ───────────────────────────────────────
  private buildFieldsForStep(step: number, mode: 'new' | 'existing'): FieldDef[] {
    if (step === STEP_SOURCE) {
      return [
        {
          key: 'shopMode',
          label: 'Quelle boutique ?',
          type: 'radio',
          options: [
            { label: 'Utiliser une boutique existante', value: 'existing' },
            { label: 'Décrire une nouvelle boutique', value: 'new' },
          ],
        },
        // Only render the shop-picker when 'existing' is selected
        ...(mode === 'existing'
          ? [{
              key: 'boutiqueExistanteId',
              label: 'Sélectionner une boutique',
              type: 'select' as const,
              required: true,
              placeholder: 'Choisir parmi vos boutiques',
              options: this.mesBoutiques().map((b) => ({ label: b.nom, value: b._id })),
            }]
          : []),
      ];
    }

    if (step === STEP_SHOP) {
      return [
        { key: 'nomBoutique', label: 'Nom de la boutique', type: 'text', required: true, placeholder: 'Ex\u00a0: Ma Boutique' },
        {
          key: 'categorieId', label: 'Catégorie', type: 'select', required: true,
          placeholder: 'Choisir une catégorie',
          options: this.categories().map((c) => ({ label: c.nom, value: c._id })),
        },
        { key: 'heureOuverture', label: "Heure d'ouverture", type: 'text', required: true, placeholder: 'HH:MM', rowGroup: 'horaires' },
        { key: 'heureFermeture', label: 'Heure de fermeture', type: 'text', required: true, placeholder: 'HH:MM', rowGroup: 'horaires' },
        { key: '_jours_label', label: "Jours d'ouverture", type: 'label' },
        { key: 'lundi',    label: 'Lundi',    type: 'checkbox', rowGroup: 'jours1' },
        { key: 'mardi',    label: 'Mardi',    type: 'checkbox', rowGroup: 'jours1' },
        { key: 'mercredi', label: 'Mercredi', type: 'checkbox', rowGroup: 'jours1' },
        { key: 'jeudi',    label: 'Jeudi',    type: 'checkbox', rowGroup: 'jours1' },
        { key: 'vendredi', label: 'Vendredi', type: 'checkbox', rowGroup: 'jours2' },
        { key: 'samedi',   label: 'Samedi',   type: 'checkbox', rowGroup: 'jours2' },
        { key: 'dimanche', label: 'Dimanche', type: 'checkbox', rowGroup: 'jours2' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3, placeholder: 'Décrivez votre boutique…' },
        { key: 'logo', label: 'Logo (URL)', type: 'text', placeholder: 'https://example.com/logo.png' },
      ];
    }

    if (step === STEP_RENTAL) {
      return [
        {
          key: 'emplacementSouhaiteId', label: 'Emplacement souhaité', type: 'select', required: true,
          placeholder: 'Choisir un emplacement disponible',
          options: this.emplacementsLibres().map((e) => ({
            label: `${e.numero} — Étage ${(e.etageId as any)?.niveau ?? ''} ${(e.etageId as any)?.nom ? '(' + (e.etageId as any).nom + ')' : ''}`.trim(),
            value: e._id,
          })),
        },
        { key: 'dateDebutSouhaitee', label: 'Date de début souhaitée', type: 'date', required: true, rowGroup: 'dates' },
        { key: 'dateFinSouhaitee',   label: 'Date de fin souhaitée',   type: 'date', rowGroup: 'dates' },
      ];
    }

    return [];
  }

  // ── Dialog lifecycle ─────────────────────────────────────────────────────────
  openCreateDialog() {
    const mode: 'new' | 'existing' = 'new';
    this.shopMode.set(mode);
    this.currentStepIndex.set(STEP_SOURCE);
    this.applyValidatorsForMode(mode);
    this.form.reset({
      shopMode: mode, boutiqueExistanteId: '',
      nomBoutique: '', categorieId: '', heureOuverture: '', heureFermeture: '',
      description: '', logo: '',
      lundi: false, mardi: false, mercredi: false, jeudi: false,
      vendredi: false, samedi: false, dimanche: false,
      emplacementSouhaiteId: '', dateDebutSouhaitee: '', dateFinSouhaitee: '',
    }, { emitEvent: false });
    this.formFields.set(this.buildFieldsForStep(STEP_SOURCE, mode));
    this.dialogVisible.set(true);
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.currentStepIndex.set(STEP_SOURCE);
    this.shopMode.set('new');
    this.form.reset({}, { emitEvent: false });
  }

  // ── Step navigation ──────────────────────────────────────────────────────────
  private validateCurrentStep(): boolean {
    const step = this.currentStepIndex();
    const mode = this.shopMode();

    if (step === STEP_SOURCE && mode === 'existing') {
      const ctrl = this.form.get('boutiqueExistanteId');
      ctrl?.markAsTouched();
      if (ctrl?.invalid) {
        this.messageService.add({ severity: 'warn', summary: 'Sélection requise', detail: 'Veuillez choisir une boutique existante.' });
        return false;
      }
    }

    if (step === STEP_SHOP) {
      const keys = ['nomBoutique', 'categorieId', 'heureOuverture', 'heureFermeture'];
      keys.forEach((k) => this.form.get(k)?.markAsTouched());
      // Field error messages are displayed inline — no additional toast needed
      if (keys.some((k) => this.form.get(k)?.invalid)) return false;
    }

    return true;
  }

  onNextStep() {
    if (!this.validateCurrentStep()) return;

    const mode    = this.shopMode();
    const current = this.currentStepIndex();

    let next: number;
    if (current === STEP_SOURCE) {
      next = mode === 'existing' ? STEP_RENTAL : STEP_SHOP;
    } else {
      next = STEP_RENTAL; // STEP_SHOP → STEP_RENTAL
    }

    this.currentStepIndex.set(next);
    this.formFields.set(this.buildFieldsForStep(next, mode));
  }

  onPrevStep() {
    const mode    = this.shopMode();
    const current = this.currentStepIndex();

    let prev: number;
    if (current === STEP_RENTAL) {
      prev = mode === 'existing' ? STEP_SOURCE : STEP_SHOP;
    } else {
      prev = STEP_SOURCE; // STEP_SHOP → STEP_SOURCE
    }

    this.currentStepIndex.set(prev);
    this.formFields.set(this.buildFieldsForStep(prev, mode));
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  submitDemande() {
    const { emplacementSouhaiteId, dateDebutSouhaitee, dateFinSouhaitee } = this.form.value;
    if (!emplacementSouhaiteId || !dateDebutSouhaitee) {
      this.form.get('emplacementSouhaiteId')?.markAsTouched();
      this.form.get('dateDebutSouhaitee')?.markAsTouched();
      return;
    }

    this.saving.set(true);
    const mode = this.shopMode();
    let payload: any;

    if (mode === 'existing') {
      payload = {
        boutiqueExistanteId: this.form.value.boutiqueExistanteId,
        emplacementSouhaiteId,
        dateDebutSouhaitee,
        ...(dateFinSouhaitee ? { dateFinSouhaitee } : {}),
      };
    } else {
      const v = this.form.value;
      const joursOuverture = JOURS.filter((j) => v[j]);
      payload = {
        nomBoutique: v.nomBoutique, categorieId: v.categorieId,
        heureOuverture: v.heureOuverture, heureFermeture: v.heureFermeture,
        joursOuverture,
        ...(v.description ? { description: v.description } : {}),
        ...(v.logo        ? { logo: v.logo }               : {}),
        emplacementSouhaiteId, dateDebutSouhaitee,
        ...(dateFinSouhaitee ? { dateFinSouhaitee } : {}),
      };
    }

    this.demandeService.createDemande(payload).subscribe({
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
        const body = err?.error;
        const fieldErrors: { msg: string; path: string }[] = body?.errors ?? [];
        if (fieldErrors.length > 0) {
          fieldErrors.forEach((e) =>
            this.messageService.add({
              severity: 'error',
              summary: e.path,
              detail: e.msg,
            })
          );
        } else {
          const detail = body?.message ?? 'Impossible de soumettre votre demande';
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail });
        }
        this.saving.set(false);
      },
    });
  }
}
