import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  inject,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { Boutique, BoutiquePopulated, Categorie } from '../../core/models';
import { ProduitBase } from '../../core/models/produit.model';
import { PromotionBase } from '../../core/models/promotion.model';
import { ProduitService } from '../../core/services/produit.service';
import { PromotionService } from '../../core/services/promotion.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-shop-detail-modal',
  imports: [CommonModule, DialogModule, ButtonModule, CardModule, TagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-dialog
      [visible]="visible()"
      [modal]="true"
      [closable]="true"
      [dismissableMask]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '90vw', maxWidth: '640px' }"
      (visibleChange)="onVisibleChange($event)"
      styleClass="shop-detail-dialog">

      @if (boutique(); as shop) {
        <ng-template #header>
          <div class="dialog-header">
            <img [src]="shop.logo" [alt]="shop.nom + ' logo'" class="shop-logo">
            <div class="shop-title">
              <h2>{{ shop.nom }}</h2>
              @if (boutique()?.categorieId; as cat) {
                <p-tag
                  [value]="cat.nom"
                  [icon]="getIconClass(cat.icon)"
                  [style]="{ 'background-color': cat.couleur, 'color': 'white' }"
                />
              }
            </div>
          </div>
        </ng-template>

        <div class="shop-content">

          <!-- ─── Basic info ─────────────────────────────────────── -->
          <div class="shop-description">
            <h3>A propos</h3>
            <p>{{ shop.description }}</p>
          </div>

          <div class="shop-hours">
            <h3>Heures d'ouverture</h3>
            <div class="hours-info">
              <i class="pi pi-clock"></i>
              <span>{{ shop.heureOuverture }} - {{ shop.heureFermeture }}</span>
            </div>
            <div class="days-info">
              <i class="pi pi-calendar"></i>
              <span>{{ formatJours(shop.joursOuverture) }}</span>
            </div>
          </div>

          @if (shop.statut === 'validee') {
            <div class="shop-status">
              <i class="pi pi-check-circle" style="color: var(--color-success);"></i>
              <span>Boutique vérifiée</span>
            </div>
          }

          <!-- ─── Loading overlay ──────────────────────────────────── -->
          @if (loadingEnrichment()) {
            <div class="enrichment-loading" role="status" aria-live="polite">
              <i class="pi pi-spin pi-spinner" aria-hidden="true"></i>
              <span>Chargement des produits et promotions…</span>
            </div>
          }

          <!-- ─── Products carousel ────────────────────────────────── -->
          @if (!loadingEnrichment() && produits().length > 0) {
            <div class="section-products">
              <h3><i class="pi pi-box section-icon"></i> Produits</h3>
              <div class="product-carousel" role="list">
                @for (p of produits(); track p._id) {
                  <div class="product-card" role="listitem">
                    @if (p.image) {
                      <img
                        [src]="getImageSrc(p.image)"
                        [alt]="p.nom"
                        class="product-img"
                      />
                    } @else {
                      <div class="product-img-placeholder">
                        <i class="pi pi-image"></i>
                      </div>
                    }
                    <div class="product-info">
                      <span class="product-name">{{ p.nom }}</span>
                      <span class="product-price">{{ formatPrice(p.prix) }}</span>
                      @if (p.enAvant) {
                        <span class="product-featured-badge">
                          <i class="pi pi-star-fill"></i> En avant
                        </span>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- ─── Active promotions ─────────────────────────────────── -->
          @if (!loadingEnrichment() && activePromotions().length > 0) {
            <div class="section-promotions">
              <h3><i class="pi pi-tag section-icon"></i> Promotions en cours</h3>
              <div class="promotions-list" role="list">
                @for (promo of activePromotions(); track promo._id) {
                  <div class="promo-card promo-active" role="listitem">
                    @if (promo.image) {
                      <img
                        [src]="getImageSrc(promo.image)"
                        [alt]="promo.titre"
                        class="promo-banner"
                      />
                    }
                    <div class="promo-body">
                      <div class="promo-header-row">
                        <span class="promo-title">{{ promo.titre }}</span>
                        @if (promo.reduction != null) {
                          <span class="promo-badge active-badge">-{{ promo.reduction }}%</span>
                        }
                      </div>
                      @if (promo.description) {
                        <p class="promo-desc">{{ promo.description }}</p>
                      }
                      <span class="promo-dates">
                        <i class="pi pi-calendar"></i>
                        Jusqu'au {{ promo.dateFin | date:'dd/MM/yyyy' }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- ─── Upcoming promotions ───────────────────────────────── -->
          @if (!loadingEnrichment() && upcomingPromotions().length > 0) {
            <div class="section-promotions">
              <h3><i class="pi pi-clock section-icon"></i> Promotions à venir</h3>
              <div class="promotions-list" role="list">
                @for (promo of upcomingPromotions(); track promo._id) {
                  <div class="promo-card promo-upcoming" role="listitem">
                    @if (promo.image) {
                      <img
                        [src]="getImageSrc(promo.image)"
                        [alt]="promo.titre"
                        class="promo-banner"
                      />
                    }
                    <div class="promo-body">
                      <div class="promo-header-row">
                        <span class="promo-title">{{ promo.titre }}</span>
                        @if (promo.reduction != null) {
                          <span class="promo-badge upcoming-badge">-{{ promo.reduction }}%</span>
                        }
                      </div>
                      @if (promo.description) {
                        <p class="promo-desc">{{ promo.description }}</p>
                      }
                      <span class="promo-dates">
                        <i class="pi pi-calendar"></i>
                        Dès le {{ promo.dateDebut | date:'dd/MM/yyyy' }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

        </div>

        <ng-template #footer>
          <p-button
            label="Fermer"
            icon="pi pi-times"
            (onClick)="onVisibleChange(false)"
            [text]="true"
            severity="secondary">
          </p-button>
        </ng-template>
      }
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep .shop-detail-dialog {
      .p-dialog-header {
        padding: 1.5rem;
        border-bottom: 1px solid var(--color-border);
      }

      .p-dialog-content {
        padding: 1.5rem;
      }

      .p-dialog-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--color-border);
      }
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 100%;
    }

    .shop-logo {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      object-fit: cover;
      border: 2px solid var(--color-border);
    }

    .shop-title {
      flex: 1;

      h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--color-text-primary);
      }
    }

    .shop-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      h3 {
        margin: 0 0 0.75rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--color-text-primary);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      p {
        margin: 0;
        line-height: 1.5;
        color: var(--color-text-secondary);
      }
    }

    .section-icon {
      color: var(--color-primary);
    }

    .shop-hours {
      .hours-info,
      .days-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        color: var(--color-text-secondary);

        i {
          color: var(--color-primary);
        }
      }
    }

    .shop-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background-color: var(--color-background-secondary);
      border-radius: 6px;
      font-weight: 500;
      color: var(--color-success);
    }

    /* ── Enrichment loading ── */
    .enrichment-loading {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--color-background-secondary);
      border-radius: 6px;
      color: var(--color-text-secondary);
      font-size: 0.875rem;

      i {
        color: var(--color-primary);
      }
    }

    /* ── Product carousel ── */
    .section-products {
    }

    .product-carousel {
      display: flex;
      gap: 0.75rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
      scroll-snap-type: x mandatory;

      &::-webkit-scrollbar {
        height: 4px;
      }
      &::-webkit-scrollbar-track {
        background: var(--color-background-secondary);
        border-radius: 2px;
      }
      &::-webkit-scrollbar-thumb {
        background: var(--color-border);
        border-radius: 2px;
      }
    }

    .product-card {
      flex: 0 0 130px;
      scroll-snap-align: start;
      background: var(--color-background-secondary);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .product-img {
      width: 130px;
      height: 100px;
      object-fit: cover;
    }

    .product-img-placeholder {
      width: 130px;
      height: 100px;
      background: var(--color-background-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-disabled);
      font-size: 1.5rem;
    }

    .product-info {
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .product-name {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--color-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .product-price {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--color-primary);
    }

    .product-featured-badge {
      font-size: 0.6875rem;
      color: var(--color-success);
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    /* ── Promotions list ── */
    .section-promotions {
    }

    .promotions-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .promo-card {
      border-radius: 8px;
      border: 1px solid var(--color-border);
      overflow: hidden;
      background: var(--color-background-secondary);

      &.promo-active {
        border-left: 4px solid var(--color-success);
      }

      &.promo-upcoming {
        border-left: 4px solid var(--color-info, #0ea5e9);
      }
    }

    .promo-banner {
      width: 100%;
      height: 100px;
      object-fit: cover;
      display: block;
    }

    .promo-body {
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .promo-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .promo-title {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .promo-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      white-space: nowrap;

      &.active-badge {
        background: color-mix(in srgb, var(--color-success) 15%, transparent);
        color: var(--color-success);
      }

      &.upcoming-badge {
        background: color-mix(in srgb, var(--color-info, #0ea5e9) 15%, transparent);
        color: var(--color-info, #0ea5e9);
      }
    }

    .promo-desc {
      font-size: 0.8125rem;
      color: var(--color-text-secondary);
      line-height: 1.4;
    }

    .promo-dates {
      font-size: 0.8125rem;
      color: var(--color-text-disabled);
      display: flex;
      align-items: center;
      gap: 0.375rem;

      i {
        font-size: 0.75rem;
      }
    }
  `]
})
export class ShopDetailModalComponent {
  visible = input.required<boolean>();
  boutique = input.required<BoutiquePopulated | null>();
  visibleChange = output<boolean>();

  private produitService = inject(ProduitService);
  private promotionService = inject(PromotionService);

  // ── Enrichment data signals ────────────────────────────────────────────────
  produits = signal<ProduitBase[]>([]);
  allPromotions = signal<PromotionBase[]>([]);
  loadingEnrichment = signal(false);

  // ── Computed promotion filters ─────────────────────────────────────────────
  readonly activePromotions = computed(() => {
    const now = new Date();
    return this.allPromotions().filter(
      (p) => new Date(p.dateDebut) <= now && now <= new Date(p.dateFin)
    );
  });

  readonly upcomingPromotions = computed(() => {
    const now = new Date();
    return this.allPromotions().filter((p) => new Date(p.dateDebut) > now);
  });

  constructor() {
    // Load products & promotions whenever the boutique changes and modal opens
    effect(() => {
      const shop = this.boutique();
      if (shop && this.visible()) {
        this.loadBoutiqueEnrichment(shop._id);
      } else if (!shop) {
        this.produits.set([]);
        this.allPromotions.set([]);
      }
    });
  }

  private loadBoutiqueEnrichment(boutiqueId: string): void {
    this.loadingEnrichment.set(true);
    this.produits.set([]);
    this.allPromotions.set([]);

    let produitsDone = false;
    let promotionsDone = false;

    const checkDone = () => {
      if (produitsDone && promotionsDone) {
        this.loadingEnrichment.set(false);
      }
    };

    this.produitService.getProduitsByBoutique(boutiqueId).subscribe({
      next: (list) => {
        this.produits.set(list as unknown as ProduitBase[]);
        produitsDone = true;
        checkDone();
      },
      error: () => {
        produitsDone = true;
        checkDone();
      },
    });

    this.promotionService.getPromotionsByBoutique(boutiqueId).subscribe({
      next: (list) => {
        this.allPromotions.set(list as unknown as PromotionBase[]);
        promotionsDone = true;
        checkDone();
      },
      error: () => {
        promotionsDone = true;
        checkDone();
      },
    });
  }

  onVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
  }

  getIconClass(icon: string): string {
    return icon?.startsWith('pi ') ? icon : `pi ${icon}`;
  }

  formatJours(jours: string[]): string {
    if (jours.length === 7) return 'Tous les jours';
    if (jours.length === 0) return 'Fermé';

    const jourMap: Record<string, string> = {
      'lundi': 'Lun',
      'mardi': 'Mar',
      'mercredi': 'Mer',
      'jeudi': 'Jeu',
      'vendredi': 'Ven',
      'samedi': 'Sam',
      'dimanche': 'Dim'
    };

    return jours.map(j => jourMap[j] || j).join(', ');
  }

  formatPrice(prix: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA' }).format(prix);
  }

  getImageSrc(image: string | null | undefined): string {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    if (image.startsWith('/uploads')) {
      return `${environment.apiUrl.replace('/api', '')}${image}`;
    }
    return image;
  }
}

