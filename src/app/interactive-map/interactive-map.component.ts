import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { EtageService } from '../core/services/etage.service';
import { EmplacementService } from '../core/services/emplacement.service';
import { BoutiqueService } from '../core/services/boutique.service';
import { VisitTrackingService } from '../core/services/visit-tracking.service';
import { Etage, Emplacement, Boutique, BoutiquePopulated } from '../core/models';
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

          <div class="map-legend">
            <h3 class="legend-title">Légende</h3>
            <div class="legend-items">
              <div class="legend-item">
                <div class="legend-color occupied"></div>
                <span>Boutique Occupée</span>
              </div>
              <div class="legend-item">
                <div class="legend-color available"></div>
                <span>Emplacement Disponible</span>
              </div>
            </div>
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
    }

    .map-legend {
      position: absolute;
      bottom: 2rem;
      left: 2rem;
      background: var(--color-background-primary);
      padding: 1rem 1.25rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

      &.occupied {
        background-color: var(--color-primary);
      }

      &.available {
        background-color: transparent;
        border: 2px dashed var(--color-text-disabled);
      }
    }

    @media (max-width: 768px) {
      .map-container {
        flex-direction: column;
        padding: 1rem;
      }

      .map-legend {
        bottom: 1rem;
        left: 1rem;
        padding: 0.75rem 1rem;
      }

      .legend-items {
        gap: 0.5rem;
      }
    }
  `]
})
export class InteractiveMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private platformId = inject(PLATFORM_ID);
  private etageService = inject(EtageService);
  private emplacementService = inject(EmplacementService);
  private boutiqueService = inject(BoutiqueService);
  private visitTrackingService = inject(VisitTrackingService);
  private router = inject(Router);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Signals
  etages = signal<Etage[]>([]);
  selectedEtageId = signal<string>('');
  emplacements = signal<Emplacement[]>([]);
  selectedBoutique = signal<BoutiquePopulated | null>(null);
  showShopModal = signal<boolean>(false);

  // Computed
  currentEtage = computed<Etage | undefined>(() =>
    this.etages().find(e => e._id === this.selectedEtageId())
  );

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private backgroundImage: HTMLImageElement | null = null;
  private hoveredEmplacement: Emplacement | null = null;

  constructor() {
    // Load initial data
    this.loadData();

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
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.trackMapVisitIfHomeRoute();
      this.initializeCanvas();
    }
  }

  ngOnDestroy(): void {
    // Cleanup
  }

  private trackMapVisitIfHomeRoute(): void {
    if (this.router.url !== '/') {
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
    this.emplacementService.getEmplacementsByEtage(etageId).subscribe(emplacements => {
      this.emplacements.set(emplacements);
      if (this.isBrowser) {
        this.loadFloorPlanImage();
      }
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
    emplacements.forEach(emp => {
      this.drawEmplacement(emp);
    });
  }

  private drawEmplacement(emplacement: Emplacement): void {
    if (!this.ctx) return;

    const ctx = this.ctx;
    const coord = emplacement.coordonnees;
    const isHovered = this.hoveredEmplacement?._id === emplacement._id;

    if (emplacement.statut === 'occupe') {
      // Occupied slot - filled with primary color
      ctx.fillStyle = isHovered
        ? this.getCSSVariable('--color-primary-dark')
        : this.getCSSVariable('--color-primary');
      ctx.fillRect(coord.x, coord.y, coord.width, coord.height);

      // Border
      ctx.strokeStyle = this.getCSSVariable('--color-primary-dark');
      ctx.lineWidth = 2;
      ctx.strokeRect(coord.x, coord.y, coord.width, coord.height);

      // Draw shop number
      ctx.fillStyle = this.getCSSVariable('--color-background-primary');
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emplacement.numero, coord.x + coord.width / 2, coord.y + coord.height / 2);
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

      // Draw "Available" text
      ctx.fillStyle = this.getCSSVariable('--color-background-primary');
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Vide', coord.x + coord.width / 2, coord.y + coord.height / 2);
    }
  }

  onCanvasClick(event: MouseEvent): void {
    const emplacement = this.getEmplacementAtPoint(event);

    if (emplacement && emplacement.statut === 'occupe' && emplacement.boutiqueId) {
      // Extract ID from boutiqueId (might be populated object or just ID string)
      const boutiqueId = typeof emplacement.boutiqueId === 'object'
        ? emplacement.boutiqueId._id
        : emplacement.boutiqueId;

      this.boutiqueService.getBoutiqueById(boutiqueId).subscribe(boutique => {
        if (boutique) {
          this.selectedBoutique.set(boutique);
          this.showShopModal.set(true);
        }
      });
    }
  }

  onCanvasMouseMove(event: MouseEvent): void {
    const emplacement = this.getEmplacementAtPoint(event);

    // Update cursor
    if (this.canvas) {
      this.canvas.style.cursor = emplacement && emplacement.statut === 'occupe' ? 'pointer' : 'default';
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
