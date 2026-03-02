import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  afterNextRender,
  ViewChild,
  ElementRef,
  OnDestroy,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { EtageService } from '../core/services/etage.service';
import { EmplacementService } from '../core/services/emplacement.service';
import { LocationService } from '../core/services/location.service';
import { VisitTrackingService } from '../core/services/visit-tracking.service';
import { ThemeService } from '../core/services/theme.service';
import { PromotionService } from '../core/services/promotion.service';
import { Etage, Emplacement, EmplacementBase, BoutiquePopulated, LocationEmplacementPopulated, Promotion, isPromotionPopulated } from '../core/models';
import { FloorSelectorComponent } from './floor-selector/floor-selector.component';
import { ShopDetailModalComponent } from './shop-detail-modal/shop-detail-modal.component';

@Component({
  selector: 'app-interactive-map',
  imports: [CommonModule, ButtonModule, FloorSelectorComponent, ShopDetailModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="map-container">
      <!-- Map Canvas -->
      <div class="canvas-wrapper">
          <canvas
            #mapCanvas
            class="map-canvas"
            (click)="onCanvasClick($event)"
            (mousemove)="onCanvasMouseMove($event)"
            [attr.aria-label]="'Interactive mall map for ' + currentEtage()?.nom">
          </canvas>

          @if (loadingSlots() || loadingLocations()) {
            <div class="map-loading-overlay" role="status" aria-live="polite">
              <i class="pi pi-spin pi-spinner" aria-hidden="true"></i>
              <span>{{ loadingSlots() ? 'Chargement des emplacements…' : 'Chargement des boutiques…' }}</span>
            </div>
          }

          <div class="map-legend" [class.legend-collapsed]="!legendOpen()">
            <button class="legend-toggle" (click)="toggleLegend()" [attr.aria-expanded]="legendOpen()" aria-label="Afficher/masquer la légende">
              <h3 class="legend-title">Légende</h3>
              <i class="pi legend-toggle-icon" [class.pi-chevron-up]="legendOpen()" [class.pi-chevron-down]="!legendOpen()"></i>
            </button>
            @if (legendOpen()) {
              <div class="legend-items">
                <div class="legend-item">
                  <div class="legend-color occupied"></div>
                  <span>Boutique Occupée</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color available"></div>
                  <span>Emplacement Disponible</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color promotion">★</div>
                  <span>Promotion en cours</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Floor Selector Sidebar -->
        <aside class="floor-sidebar">
          <app-floor-selector
            [etages]="etages()"
            [selectedEtageId]="selectedEtageId()"
            (etageSelected)="onEtageSelected($event)">
          </app-floor-selector>
        </aside>

      <!-- Shop Detail Modal -->
      <app-shop-detail-modal
        [visible]="showShopModal()"
        [boutique]="selectedBoutique()"
        (visibleChange)="onModalVisibleChange($event)">
      </app-shop-detail-modal>
    </div>
  `,
  styles: [`
    .map-container {
      display: flex;
      gap: 2rem;
      height: 100%;
      overflow: hidden;
      padding: 2rem;
      background: var(--color-background-secondary);
    }

    .canvas-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .floor-sidebar {
      display: flex;
      align-items: center;
    }

    .map-canvas {
      max-width: 100%;
      max-height: 100%;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      cursor: default;
      display: block;
    }

    .map-loading-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      background: color-mix(in srgb, var(--color-background-primary) 80%, transparent);
      border-radius: 8px;
      backdrop-filter: blur(2px);
      color: var(--color-text-primary);
      font-size: 0.9375rem;
      pointer-events: none;

      i {
        font-size: 2rem;
        color: var(--color-primary);
      }
    }

    .map-legend {
      position: absolute;
      bottom: 2rem;
      left: 2rem;
      background: var(--color-background-primary);
      padding: 1rem 1.25rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      min-width: 160px;
    }

    .legend-toggle {
      display: none;
      width: 100%;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .legend-toggle-icon {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .legend-title {
      margin: 0 0 0.75rem 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .legend-items {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .legend-color {
      width: 30px;
      height: 20px;
      border-radius: 4px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;

      &.occupied {
        background-color: var(--color-primary);
      }

      &.available {
        background-color: transparent;
        border: 2px dashed var(--color-text-disabled);
      }

      &.promotion {
        background-color: #f59e0b;
        color: white;
        font-size: 0.75rem;
        line-height: 1;
      }
    }

    @media (max-width: 768px) {
      .map-container {
        position: relative;
        flex-direction: row;
        padding: 1rem;
        height: auto;
        overflow: visible;
        align-items: flex-start;
      }

      .canvas-wrapper {
        flex: 1;
        height: 60vh;
        min-height: 340px;
        overflow: auto;
        align-items: flex-start;
        justify-content: flex-start;
      }

      .map-canvas {
        max-width: none;
        max-height: none;
      }

      .floor-sidebar {
        position: absolute;
        right: 1rem;
        top: 1rem;
        z-index: 10;
        align-items: flex-start;
      }

      .map-legend {
        bottom: 0.75rem;
        left: 0.75rem;
        padding: 0.5rem 0.75rem;
        min-width: 0;
      }

      .legend-toggle {
        display: flex;
      }

      .legend-title {
        margin: 0;
        font-size: 0.8125rem;
      }

      .legend-collapsed .legend-title {
        margin: 0;
      }

      .legend-items {
        gap: 0.5rem;
        margin-top: 0.5rem;
      }
    }
  `]
})
export class InteractiveMapComponent implements OnDestroy {
  @ViewChild('mapCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private platformId = inject(PLATFORM_ID);
  private etageService = inject(EtageService);
  private emplacementService = inject(EmplacementService);
  private locationService = inject(LocationService);
  private promotionService = inject(PromotionService);
  private visitTrackingService = inject(VisitTrackingService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Signals
  etages = signal<Etage[]>([]);
  selectedEtageId = signal<string>('');
  emplacements = signal<Emplacement[]>([]);
  selectedBoutique = signal<BoutiquePopulated | null>(null);
  showShopModal = signal<boolean>(false);
  loadingSlots = signal(false);
  loadingLocations = signal(false);
  activeLocations = signal<LocationEmplacementPopulated[]>([]);
  activePromotions = signal<Promotion[]>([]);
  legendOpen = signal<boolean>(true);

  // Computed
  currentEtage = computed<Etage | undefined>(() =>
    this.etages().find(e => e._id === this.selectedEtageId())
  );

  readonly activeLocationMap = computed(() => {
    const map = new Map<string, LocationEmplacementPopulated>();
    this.activeLocations().forEach(loc => {
      const id = typeof loc.emplacementId === 'string' ? loc.emplacementId : loc.emplacementId._id;
      map.set(id, loc);
    });
    return map;
  });

  /** Set of boutique IDs that have active or upcoming promotions. */
  readonly promotionBoutiqueIds = computed(() => {
    const now = new Date();
    return new Set(
      this.activePromotions()
        .filter(p => new Date(p.dateFin) >= now)
        .map(p => isPromotionPopulated(p) ? p.boutiqueId._id : p.boutiqueId)
    );
  });

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private backgroundImage: HTMLImageElement | null = null;
  private hoveredEmplacement: Emplacement | null = null;

  constructor() {
    // Load initial data
    this.loadData();
    this.loadActivePromotions();

    // Only run browser-specific effects in the browser
    if (this.isBrowser) {
      // Redraw when floor changes
      effect(() => {
        const etageId = this.selectedEtageId();
        if (etageId) {
          this.loadEmplacements(etageId);
        }
      });

      // Redraw when emplacements change
      effect(() => {
        const emplacements = this.emplacements();
        if (emplacements.length > 0 && this.ctx) {
          this.drawMap();
        }
      });

      // Redraw when active locations finish loading
      effect(() => {
        this.activeLocations();
        if (this.emplacements().length > 0 && this.ctx) {
          this.drawMap();
        }
      });

      // Redraw when promotions change
      effect(() => {
        this.promotionBoutiqueIds();
        if (this.emplacements().length > 0 && this.ctx) {
          requestAnimationFrame(() => this.drawMap());
        }
      });

      // Redraw when the theme changes (CSS variables update before next frame)
      effect(() => {
        this.themeService.currentTheme();
        if (this.ctx) {
          requestAnimationFrame(() => this.drawMap());
        }
      });

      // Use afterNextRender to initialise the canvas only after the client has
      // fully taken over from SSR — this avoids hydration-timing issues that
      // caused the `/` (index) route to render a blank canvas.
      afterNextRender(() => {
        this.trackMapVisitIfHomeRoute();
        this.initializeCanvas();
      });
    }
  }

  ngOnDestroy(): void {
    // Cleanup
  }

  private trackMapVisitIfHomeRoute(): void {
    const url = this.router.url;
    if (url !== '/' && url !== '/plan') {
      return;
    }

    this.visitTrackingService.trackMapHomeVisit().subscribe({
      error: () => {
      },
    });
  }

  /**
   * Get the value of a CSS variable from the document
   */
  private getCSSVariable(varName: string): string {
    if (!this.isBrowser) return '';
    return getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
  }

  private loadData(): void {
    this.etageService.getEtages().subscribe(etages => {
      this.etages.set(etages);
      if (etages.length > 0) {
        this.selectedEtageId.set(etages[0]._id);
      }
    });
  }

  private loadEmplacements(etageId: string): void {
    this.loadingSlots.set(true);
    this.emplacementService.getEmplacementsByEtage(etageId).subscribe({
      next: (emplacements) => {
        // Spread to always produce a new reference so the signal fires even on HTTP 304
        this.emplacements.set([...emplacements]);
        this.loadingSlots.set(false);
        if (this.isBrowser) {
          this.loadFloorPlanImage();
        }
        this.loadActiveLocations(etageId);
      },
      error: () => {
        this.loadingSlots.set(false);
      }
    });
  }

  private loadActiveLocations(etageId: string): void {
    this.loadingLocations.set(true);
    this.locationService.getActiveLocations(etageId).subscribe({
      next: (locations) => {
        // Spread to always produce a new reference so the signal fires even on HTTP 304
        this.activeLocations.set([...locations]);
        this.loadingLocations.set(false);
      },
      error: () => {
        this.loadingLocations.set(false);
      }
    });
  }

  private loadActivePromotions(): void {
    this.promotionService.getActivePromotions().subscribe({
      next: (promotions) => this.activePromotions.set([...promotions]),
      error: () => {},
    });
  }

  private initializeCanvas(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    if (this.canvas && this.ctx) {
      // Set canvas size
      this.canvas.width = 1200;
      this.canvas.height = 800;
      this.drawMap();
    }
  }

  private loadFloorPlanImage(): void {
    if (!this.isBrowser) return;

    const etage = this.currentEtage();
    if (!etage) return;

    this.backgroundImage = new Image();
    this.backgroundImage.crossOrigin = 'anonymous';
    this.backgroundImage.onload = () => {
      this.drawMap();
    };
    this.backgroundImage.onerror = () => {
      console.warn('Failed to load floor plan image, using fallback');
      this.drawMap();
    };
    this.backgroundImage.src = etage.planImage;
  }

  private drawMap(): void {
    if (!this.ctx || !this.canvas) return;

    const ctx = this.ctx;
    const canvas = this.canvas;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = this.getCSSVariable('--color-background-secondary');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background image if loaded
    if (this.backgroundImage?.complete) {
      ctx.globalAlpha = 0.3;
      ctx.drawImage(this.backgroundImage, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;
    }

    // Draw emplacements
    const emplacements = this.emplacements();
    const locationMap = this.activeLocationMap();
    const promoIds = this.promotionBoutiqueIds();
    emplacements.forEach(emp => {
      this.drawEmplacement(emp as EmplacementBase, locationMap.get(emp._id), promoIds);
    });
  }

  private drawEmplacement(
    emplacement: EmplacementBase,
    location: LocationEmplacementPopulated | undefined,
    promoIds: Set<string>,
  ): void {
    if (!this.ctx) return;

    const ctx = this.ctx;
    const coord = emplacement.coordonnees;
    const isHovered = this.hoveredEmplacement?._id === emplacement._id;

    if (location) {
      const boutique = location.boutiqueId;
      const boutiqueId = typeof boutique === 'string' ? boutique : boutique._id;
      const hasPromo = promoIds.has(boutiqueId);
      const shopName = typeof boutique === 'string' ? '' : boutique.nom;

      // Occupied slot - filled with primary color
      ctx.fillStyle = isHovered
        ? this.getCSSVariable('--color-primary-dark')
        : this.getCSSVariable('--color-primary');
      ctx.fillRect(coord.x, coord.y, coord.width, coord.height);

      // Border
      ctx.strokeStyle = this.getCSSVariable('--color-primary-dark');
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.strokeRect(coord.x, coord.y, coord.width, coord.height);

      // Decide text layout: number + name when slot is tall enough
      const labelColor = this.getCSSVariable('--color-background-primary');
      ctx.fillStyle = labelColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const hasNameRow = coord.height >= 44 && shopName;
      if (hasNameRow) {
        // Slot number (top third)
        const numFontSize = Math.max(9, Math.min(13, coord.height * 0.25, coord.width * 0.3));
        ctx.font = `bold ${numFontSize}px Inter, sans-serif`;
        ctx.fillText(
          emplacement.numero,
          coord.x + coord.width / 2,
          coord.y + coord.height * 0.32,
          coord.width - 6,
        );
        // Shop name (bottom portion, smaller)
        const nameFontSize = Math.max(8, Math.min(11, coord.height * 0.2, coord.width * 0.22));
        ctx.font = `${nameFontSize}px Inter, sans-serif`;
        ctx.fillText(
          shopName,
          coord.x + coord.width / 2,
          coord.y + coord.height * 0.65,
          coord.width - 6,
        );
      } else {
        // Small slot: only number
        const numFontSize = Math.max(9, Math.min(14, coord.height * 0.4, coord.width * 0.3));
        ctx.font = `bold ${numFontSize}px Inter, sans-serif`;
        ctx.fillText(
          emplacement.numero,
          coord.x + coord.width / 2,
          coord.y + coord.height / 2,
          coord.width - 4,
        );
      }

      // Promotion star badge in top-right corner
      if (hasPromo) {
        const badgeR = Math.min(10, coord.width * 0.18, coord.height * 0.22);
        const bx = coord.x + coord.width - badgeR - 2;
        const by = coord.y + badgeR + 2;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(bx, by, badgeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(7, badgeR * 1.1)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', bx, by);
      }
    } else {
      // Available slot - outlined
      ctx.fillStyle = isHovered
        ? this.getCSSVariable('--color-background-tertiary')
        : 'transparent';
      ctx.fillRect(coord.x, coord.y, coord.width, coord.height);

      ctx.strokeStyle = isHovered
        ? this.getCSSVariable('--color-text-disabled')
        : this.getCSSVariable('--color-border');
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(coord.x, coord.y, coord.width, coord.height);
      ctx.setLineDash([]);

      // Draw "Available" text — use text-secondary so it's visible in both themes
      ctx.fillStyle = this.getCSSVariable('--color-text-secondary');
      const emptyFontSize = Math.max(9, Math.min(12, coord.height * 0.25, coord.width * 0.25));
      ctx.font = `${emptyFontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Vide', coord.x + coord.width / 2, coord.y + coord.height / 2, coord.width - 4);
    }
  }

  onCanvasClick(event: MouseEvent): void {
    const emplacement = this.getEmplacementAtPoint(event);
    if (emplacement) {
      const location = this.activeLocationMap().get(emplacement._id);
      if (location) {
        this.selectedBoutique.set(location.boutiqueId as BoutiquePopulated);
        this.showShopModal.set(true);
      }
    }
  }

  onCanvasMouseMove(event: MouseEvent): void {
    const emplacement = this.getEmplacementAtPoint(event);

    // Update cursor
    if (this.canvas) {
      const isOccupied = emplacement ? !!this.activeLocationMap().get(emplacement._id) : false;
      this.canvas.style.cursor = isOccupied ? 'pointer' : 'default';
    }

    // Update hover state
    if (emplacement?._id !== this.hoveredEmplacement?._id) {
      this.hoveredEmplacement = emplacement;
      this.drawMap();
    }
  }

  private getEmplacementAtPoint(event: MouseEvent): Emplacement | null {
    if (!this.canvas) return null;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    return this.emplacements().find(emp => {
      const coord = emp.coordonnees;
      return x >= coord.x &&
             x <= coord.x + coord.width &&
             y >= coord.y &&
             y <= coord.y + coord.height;
    }) || null;
  }

  toggleLegend(): void {
    this.legendOpen.update(v => !v);
  }

  onEtageSelected(etageId: string): void {
    this.selectedEtageId.set(etageId);
  }

  onModalVisibleChange(visible: boolean): void {
    this.showShopModal.set(visible);
    if (!visible) {
      this.selectedBoutique.set(null);
    }
  }
}
