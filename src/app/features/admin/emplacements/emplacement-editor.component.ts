import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { Observable, forkJoin } from 'rxjs';
import { EtageService } from '../../../core/services/etage.service';
import { EmplacementService } from '../../../core/services/emplacement.service';
import { ThemeService } from '../../../core/services/theme.service';
import { EtageBase, EmplacementPopulated, EmplacementCoordonnees } from '../../../core/models';
import { FloorSelectorComponent } from '../../../interactive-map/floor-selector/floor-selector.component';
import { GenericFormDialogComponent } from '../../../shared/components/generic-form-dialog/generic-form-dialog.component';
import { GenericConfirmDialogComponent } from '../../../shared/components/generic-confirm-dialog/generic-confirm-dialog.component';
import { FieldDef } from '../../../shared/components/generic-form-dialog/generic-form-dialog.types';

// ─── Types ───────────────────────────────────────────────────────────────────

type EditMode = 'move' | 'draw';
type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

interface PendingCreate {
  tempId: string;
  etageId: string;
  numero: string;
  coordonnees: EmplacementCoordonnees;
}

interface PendingMove {
  id: string;
  coordonnees: EmplacementCoordonnees;
}

interface ResizeState {
  id: string;
  handle: ResizeHandle;
  startX: number;
  startY: number;
  origCoords: EmplacementCoordonnees;
  tempCoords: EmplacementCoordonnees;
}

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-emplacement-editor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    TooltipModule,
    ToastModule,
    FloorSelectorComponent,
    GenericFormDialogComponent,
    GenericConfirmDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './emplacement-editor.component.html',
  styleUrl: './emplacement-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmplacementEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private platformId = inject(PLATFORM_ID);
  private etageService = inject(EtageService);
  private emplacementService = inject(EmplacementService);
  private themeService = inject(ThemeService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  private isBrowser = isPlatformBrowser(this.platformId);
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private backgroundImage: HTMLImageElement | null = null;

  // ── Signals ──────────────────────────────────────────────────────
  etages = signal<EtageBase[]>([]);
  selectedEtageId = signal<string>('');
  serverEmplacements = signal<EmplacementPopulated[]>([]);
  loadingSlots = signal(false);
  saving = signal(false);

  editMode = signal<EditMode>('move');
  selectedId = signal<string | null>(null); // either real _id or tempId

  // Pending changes
  pendingMoves = signal<Map<string, EmplacementCoordonnees>>(new Map());
  pendingCreates = signal<PendingCreate[]>([]);
  pendingDeletes = signal<Set<string>>(new Set());

  // Dialogs
  createDialogVisible = signal(false);
  editDialogVisible = signal(false);
  deleteDialogVisible = signal(false);
  deletingLabel = signal('');

  // Draw state (internal, not reactive)
  private drawStart: { x: number; y: number } | null = null;
  private drawRect: EmplacementCoordonnees | null = null;
  private dragState: { id: string; offsetX: number; offsetY: number; tempCoords: EmplacementCoordonnees } | null = null;
  private resizeState: ResizeState | null = null;
  private hoveredId: string | null = null;

  // ── Computed ─────────────────────────────────────────────────────

  currentEtage = computed(() => this.etages().find(e => e._id === this.selectedEtageId()));

  /** All emplacements with pending moves applied (server + creates, minus deletes) */
  allEmplacements = computed<Array<{ id: string; numero: string; coordonnees: EmplacementCoordonnees; isNew: boolean }>>(() => {
    const deletes = this.pendingDeletes();
    const moves = this.pendingMoves();

    const existing = this.serverEmplacements()
      .filter(e => !deletes.has(e._id))
      .map(e => ({
        id: e._id,
        numero: e.numero,
        coordonnees: moves.get(e._id) ?? e.coordonnees,
        isNew: false,
      }));

    const created = this.pendingCreates().map(c => ({
      id: c.tempId,
      numero: c.numero,
      coordonnees: c.coordonnees,
      isNew: true,
    }));

    return [...existing, ...created];
  });

  hasPendingChanges = computed(() =>
    this.pendingMoves().size > 0 ||
    this.pendingCreates().length > 0 ||
    this.pendingDeletes().size > 0
  );

  selectedEmplacement = computed(() => {
    const id = this.selectedId();
    if (!id) return null;
    return this.allEmplacements().find(e => e.id === id) ?? null;
  });

  // ── Forms ─────────────────────────────────────────────────────────

  createForm: FormGroup = this.fb.group({
    numero: ['', [Validators.required, Validators.minLength(1)]],
  });

  editForm: FormGroup = this.fb.group({
    numero: ['', [Validators.required, Validators.minLength(1)]],
    x: [0, [Validators.required, Validators.min(0)]],
    y: [0, [Validators.required, Validators.min(0)]],
    width: [80, [Validators.required, Validators.min(10)]],
    height: [60, [Validators.required, Validators.min(10)]],
  });

  createFormFields: FieldDef[] = [
    {
      key: 'numero',
      label: 'Numéro du slot',
      type: 'text',
      required: true,
      placeholder: 'Ex. : A01',
    },
  ];

  editFormFields: FieldDef[] = [
    {
      key: 'numero',
      label: 'Numéro',
      type: 'text',
      required: true,
    },
    {
      key: 'x',
      label: 'X',
      type: 'number',
      required: true,
      min: 0,
      rowGroup: 'xy',
    },
    {
      key: 'y',
      label: 'Y',
      type: 'number',
      required: true,
      min: 0,
      rowGroup: 'xy',
    },
    {
      key: 'width',
      label: 'Largeur',
      type: 'number',
      required: true,
      min: 10,
      rowGroup: 'wh',
    },
    {
      key: 'height',
      label: 'Hauteur',
      type: 'number',
      required: true,
      min: 10,
      rowGroup: 'wh',
    },
  ];

  // ── Constructor ───────────────────────────────────────────────────

  constructor() {
    this.loadEtages();

    if (this.isBrowser) {
      effect(() => {
        const etageId = this.selectedEtageId();
        if (etageId) {
          this.loadEmplacements(etageId);
        }
      });

      effect(() => {
        // Redraw whenever computed emplacements change
        this.allEmplacements();
        if (this.ctx) this.drawMap();
      });

      // Redraw when the theme changes (CSS variables update before next frame)
      effect(() => {
        this.themeService.currentTheme();
        if (this.ctx) {
          requestAnimationFrame(() => this.drawMap());
        }
      });
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.canvas = this.canvasRef.nativeElement;
      this.ctx = this.canvas.getContext('2d');
      if (this.canvas && this.ctx) {
        this.canvas.width = 1200;
        this.canvas.height = 800;
        this.drawMap();
      }
    }
  }

  ngOnDestroy(): void {}

  // ── Data loading ──────────────────────────────────────────────────

  private loadEtages(): void {
    this.etageService.getAll().subscribe(etages => {
      this.etages.set(etages);
      if (etages.length > 0) {
        this.selectedEtageId.set(etages[0]._id);
      }
    });
  }

  private loadEmplacements(etageId: string): void {
    this.loadingSlots.set(true);
    // Reset pending state when switching floors
    this.clearPending();
    this.selectedId.set(null);
    this.emplacementService.getEmplacementsByEtage(etageId).subscribe({
      next: (emplacements) => {
        // Spread to always produce a new reference so the signal fires even on HTTP 304
        this.serverEmplacements.set([...emplacements]);
        this.loadingSlots.set(false);
        this.loadFloorPlanImage();
      },
      error: () => {
        this.loadingSlots.set(false);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les emplacements' });
      },
    });
  }

  private loadFloorPlanImage(): void {
    const etage = this.currentEtage();
    if (!etage?.planImage) {
      this.backgroundImage = null;
      this.drawMap();
      return;
    }
    this.backgroundImage = new Image();
    this.backgroundImage.crossOrigin = 'anonymous';
    this.backgroundImage.onload = () => this.drawMap();
    this.backgroundImage.onerror = () => {
      this.backgroundImage = null;
      this.drawMap();
    };
    this.backgroundImage.src = etage.planImage;
  }

  // ── Canvas drawing ────────────────────────────────────────────────

  private getCSSVariable(varName: string): string {
    if (!this.isBrowser) return '';
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }

  drawMap(): void {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Background
    ctx.fillStyle = this.getCSSVariable('--color-background-secondary') || '#f5f5f5';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Floor plan image
    if (this.backgroundImage?.complete && this.backgroundImage.naturalWidth > 0) {
      ctx.globalAlpha = 0.3;
      ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
      ctx.globalAlpha = 1.0;
    }

    // Draw all emplacements
    const deletes = this.pendingDeletes();
    const moves = this.pendingMoves();
    const selectedId = this.selectedId();

    this.allEmplacements().forEach(emp => {
      const isSelected = emp.id === selectedId;
      const isHovered = emp.id === this.hoveredId;
      const isMovePending = moves.has(emp.id);
      const isDeletePending = deletes.has(emp.id);

      this.drawSlot(ctx, emp.id, emp.numero, emp.coordonnees, {
        isNew: emp.isNew,
        isSelected,
        isHovered,
        isMovePending,
        isDeletePending,
      });
    });

    // Draw ghost rectangle while in draw mode
    if (this.drawRect && this.editMode() === 'draw') {
      const r = this.drawRect;
      ctx.fillStyle = 'rgba(34,197,94,0.15)';
      ctx.fillRect(r.x, r.y, r.width, r.height);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(r.x, r.y, r.width, r.height);
      ctx.setLineDash([]);
    }
  }

  private drawSlot(
    ctx: CanvasRenderingContext2D,
    id: string,
    numero: string,
    coord: EmplacementCoordonnees,
    flags: { isNew: boolean; isSelected: boolean; isHovered: boolean; isMovePending: boolean; isDeletePending: boolean },
  ): void {
    const { isNew, isSelected, isHovered, isMovePending, isDeletePending } = flags;

    let fillColor: string;
    let strokeColor: string;
    let labelColor: string;

    if (isDeletePending) {
      fillColor = 'rgba(239,68,68,0.25)';
      strokeColor = '#ef4444';
      labelColor = '#ef4444';
    } else if (isNew) {
      fillColor = isHovered ? 'rgba(34,197,94,0.35)' : 'rgba(34,197,94,0.20)';
      strokeColor = '#22c55e';
      labelColor = '#16a34a';
    } else if (isMovePending) {
      fillColor = isHovered
        ? this.getCSSVariable('--color-warning') + '55'
        : this.getCSSVariable('--color-warning') + '33';
      strokeColor = this.getCSSVariable('--color-warning') || '#f59e0b';
      labelColor = this.getCSSVariable('--color-text-primary') || '#111';
    } else {
      const primary = this.getCSSVariable('--color-primary') || '#3b82f6';
      fillColor = isHovered ? primary + 'cc' : primary + '99';
      strokeColor = primary;
      labelColor = this.getCSSVariable('--color-background-primary') || '#fff';
    }

    // Fill
    ctx.fillStyle = fillColor;
    ctx.fillRect(coord.x, coord.y, coord.width, coord.height);

    // Border
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = isSelected ? 3 : 2;
    if (isDeletePending) ctx.setLineDash([4, 4]);
    ctx.strokeRect(coord.x, coord.y, coord.width, coord.height);
    ctx.setLineDash([]);

    // Selection highlight
    if (isSelected) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.strokeRect(coord.x - 2, coord.y - 2, coord.width + 4, coord.height + 4);
      // Resize handles (only in move mode)
      if (this.editMode() === 'move') {
        this.drawResizeHandles(ctx, coord);
      }
    }

    // Label
    const fontSize = Math.min(14, coord.height * 0.4, coord.width * 0.3);
    ctx.fillStyle = isDeletePending ? '#ef4444' : isNew ? '#16a34a' : labelColor;
    ctx.font = `bold ${Math.max(9, fontSize)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      isDeletePending ? `✕ ${numero}` : numero,
      coord.x + coord.width / 2,
      coord.y + coord.height / 2,
      coord.width - 4,
    );
  }

  // ── Mouse event handlers ──────────────────────────────────────────

  onCanvasMouseDown(event: MouseEvent): void {
    if (!this.canvas) return;
    const { x, y } = this.getCanvasCoords(event);

    if (this.editMode() === 'draw') {
      this.drawStart = { x, y };
      this.drawRect = { x, y, width: 0, height: 0 };
      return;
    }

    // move mode: check resize handles on selected slot first
    const selectedId = this.selectedId();
    if (selectedId) {
      const selEmp = this.allEmplacements().find(e => e.id === selectedId);
      if (selEmp) {
        const handle = this.getResizeHandleAt(x, y, selEmp.coordonnees);
        if (handle) {
          this.resizeState = {
            id: selectedId,
            handle,
            startX: x,
            startY: y,
            origCoords: { ...selEmp.coordonnees },
            tempCoords: { ...selEmp.coordonnees },
          };
          return;
        }
      }
    }

    // Then check for drag
    const emp = this.getEmplacementAt(x, y);
    if (emp) {
      this.selectedId.set(emp.id);
      this.cdr.detectChanges();
      this.dragState = {
        id: emp.id,
        offsetX: x - emp.coordonnees.x,
        offsetY: y - emp.coordonnees.y,
        tempCoords: { ...emp.coordonnees },
      };
    } else {
      // Click on empty space deselects
      this.selectedId.set(null);
      this.cdr.detectChanges();
    }
  }

  onCanvasMouseMove(event: MouseEvent): void {
    if (!this.canvas) return;
    const { x, y } = this.getCanvasCoords(event);

    if (this.editMode() === 'draw' && this.drawStart) {
      const rx = Math.min(x, this.drawStart.x);
      const ry = Math.min(y, this.drawStart.y);
      this.drawRect = {
        x: rx,
        y: ry,
        width: Math.abs(x - this.drawStart.x),
        height: Math.abs(y - this.drawStart.y),
      };
      this.drawMap();
      return;
    }

    if (this.editMode() === 'move' && this.resizeState) {
      const newCoords = this.applyResize(this.resizeState, x, y);
      this.resizeState.tempCoords = newCoords;
      this.drawMapWithOverride(this.resizeState.id, newCoords);
      return;
    }

    if (this.editMode() === 'move' && this.dragState) {
      const newCoords: EmplacementCoordonnees = {
        x: Math.max(0, Math.min(x - this.dragState.offsetX, this.canvas.width - this.dragState.tempCoords.width)),
        y: Math.max(0, Math.min(y - this.dragState.offsetY, this.canvas.height - this.dragState.tempCoords.height)),
        width: this.dragState.tempCoords.width,
        height: this.dragState.tempCoords.height,
      };
      this.dragState.tempCoords = newCoords;
      this.drawMapWithOverride(this.dragState.id, newCoords);
      return;
    }

    // Cursor: check resize handles on selected slot first
    if (this.editMode() === 'move') {
      const selectedId = this.selectedId();
      if (selectedId) {
        const selEmp = this.allEmplacements().find(e => e.id === selectedId);
        if (selEmp) {
          const handle = this.getResizeHandleAt(x, y, selEmp.coordonnees);
          if (handle) {
            if (this.canvas.style.cursor !== this.getResizeCursor(handle)) {
              this.canvas.style.cursor = this.getResizeCursor(handle);
              this.hoveredId = null;
              this.drawMap();
            }
            return;
          }
        }
      }
    }

    // Update hover
    const emp = this.getEmplacementAt(x, y);
    const newHover = emp?.id ?? null;
    const wantedCursor = emp ? 'grab' : (this.editMode() === 'draw' ? 'crosshair' : 'default');
    if (newHover !== this.hoveredId || this.canvas.style.cursor !== wantedCursor) {
      this.hoveredId = newHover;
      this.canvas.style.cursor = wantedCursor;
      this.drawMap();
    }
  }

  onCanvasMouseUp(event: MouseEvent): void {
    if (!this.canvas) return;
    const { x, y } = this.getCanvasCoords(event);

    if (this.editMode() === 'draw' && this.drawStart) {
      const rx = Math.min(x, this.drawStart.x);
      const ry = Math.min(y, this.drawStart.y);
      const w = Math.abs(x - this.drawStart.x);
      const h = Math.abs(y - this.drawStart.y);

      this.drawStart = null;

      if (w > 20 && h > 20) {
        this.drawRect = { x: rx, y: ry, width: w, height: h };
        this.openCreateDialog();
      } else {
        this.drawRect = null;
        this.drawMap();
      }
      return;
    }

    if (this.editMode() === 'move' && this.resizeState) {
      const { id, tempCoords } = this.resizeState;
      this.resizeState = null;
      this.commitCoords(id, tempCoords);
      this.canvas!.style.cursor = 'default';
      return;
    }

    if (this.editMode() === 'move' && this.dragState) {
      const { id, tempCoords } = this.dragState;
      this.dragState = null;
      this.commitCoords(id, tempCoords);
      this.canvas!.style.cursor = 'grab';
    }
  }

  onCanvasMouseLeave(): void {
    if (this.resizeState) {
      const { id, tempCoords } = this.resizeState;
      this.resizeState = null;
      this.commitCoords(id, tempCoords);
    }
    if (this.dragState) {
      const { id, tempCoords } = this.dragState;
      this.dragState = null;
      this.commitCoords(id, tempCoords);
    }
    if (this.drawStart) {
      this.drawStart = null;
      this.drawRect = null;
      this.drawMap();
    }
    this.hoveredId = null;
  }

  // ── Canvas helpers ─────────────────────────────────────────────────

  private getCanvasCoords(event: MouseEvent): { x: number; y: number } {
    const rect = this.canvas!.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (this.canvas!.width / rect.width),
      y: (event.clientY - rect.top) * (this.canvas!.height / rect.height),
    };
  }

  private getEmplacementAt(x: number, y: number) {
    return this.allEmplacements().find(emp => {
      const c = emp.coordonnees;
      return x >= c.x && x <= c.x + c.width && y >= c.y && y <= c.y + c.height;
    }) ?? null;
  }

  // ── Resize helpers ────────────────────────────────────────────────

  private getHandlePoints(coord: EmplacementCoordonnees): Record<ResizeHandle, { x: number; y: number }> {
    const { x, y, width: w, height: h } = coord;
    return {
      nw: { x, y },
      n:  { x: x + w / 2, y },
      ne: { x: x + w, y },
      e:  { x: x + w, y: y + h / 2 },
      se: { x: x + w, y: y + h },
      s:  { x: x + w / 2, y: y + h },
      sw: { x, y: y + h },
      w:  { x, y: y + h / 2 },
    };
  }

  private drawResizeHandles(ctx: CanvasRenderingContext2D, coord: EmplacementCoordonnees): void {
    const handles = this.getHandlePoints(coord);
    const R = 5;
    for (const pt of Object.values(handles)) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, R, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  private getResizeHandleAt(x: number, y: number, coord: EmplacementCoordonnees): ResizeHandle | null {
    const handles = this.getHandlePoints(coord);
    const HIT = 8;
    for (const [handle, pt] of Object.entries(handles) as [ResizeHandle, { x: number; y: number }][]) {
      if (Math.abs(x - pt.x) <= HIT && Math.abs(y - pt.y) <= HIT) {
        return handle;
      }
    }
    return null;
  }

  private getResizeCursor(handle: ResizeHandle): string {
    switch (handle) {
      case 'nw': case 'se': return 'nwse-resize';
      case 'ne': case 'sw': return 'nesw-resize';
      case 'n':  case 's':  return 'ns-resize';
      case 'e':  case 'w':  return 'ew-resize';
    }
  }

  private applyResize(state: ResizeState, x: number, y: number): EmplacementCoordonnees {
    const dx = x - state.startX;
    const dy = y - state.startY;
    const MIN = 10;
    let { x: ox, y: oy, width: ow, height: oh } = state.origCoords;
    let nx = ox, ny = oy, nw = ow, nh = oh;

    switch (state.handle) {
      case 'nw': nx = ox + dx; ny = oy + dy; nw = ow - dx; nh = oh - dy; break;
      case 'n':                ny = oy + dy;               nh = oh - dy; break;
      case 'ne':               ny = oy + dy; nw = ow + dx; nh = oh - dy; break;
      case 'e':                              nw = ow + dx;               break;
      case 'se':                             nw = ow + dx; nh = oh + dy; break;
      case 's':                                            nh = oh + dy; break;
      case 'sw': nx = ox + dx;              nw = ow - dx; nh = oh + dy; break;
      case 'w':  nx = ox + dx;              nw = ow - dx;               break;
    }

    // Enforce minimum size
    if (nw < MIN) { if ('nw sw w'.includes(state.handle)) nx = ox + ow - MIN; nw = MIN; }
    if (nh < MIN) { if ('nw n ne'.includes(state.handle)) ny = oy + oh - MIN; nh = MIN; }
    // Clamp to canvas bounds
    nx = Math.max(0, nx);
    ny = Math.max(0, ny);

    return { x: Math.round(nx), y: Math.round(ny), width: Math.round(nw), height: Math.round(nh) };
  }

  /** Commit a coordinate change (move or resize) as a pending change */
  private commitCoords(id: string, coords: EmplacementCoordonnees): void {
    const isNew = this.pendingCreates().some(c => c.tempId === id);
    if (isNew) {
      this.pendingCreates.update(list => list.map(c => c.tempId === id ? { ...c, coordonnees: coords } : c));
    } else {
      this.pendingMoves.update(map => { const next = new Map(map); next.set(id, coords); return next; });
    }
  }

  /** Redraws the map substituting a temporary position/size for an active drag or resize */
  private drawMapWithOverride(id: string, overrideCoords: EmplacementCoordonnees): void {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = this.getCSSVariable('--color-background-secondary') || '#f5f5f5';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.backgroundImage?.complete && this.backgroundImage.naturalWidth > 0) {
      ctx.globalAlpha = 0.3;
      ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
      ctx.globalAlpha = 1.0;
    }

    const deletes = this.pendingDeletes();
    const moves = this.pendingMoves();
    const selectedId = this.selectedId();

    this.allEmplacements().forEach(emp => {
      const coord = emp.id === id ? overrideCoords : emp.coordonnees;
      const isMovePending = emp.id === id || moves.has(emp.id);
      this.drawSlot(ctx, emp.id, emp.numero, coord, {
        isNew: emp.isNew,
        isSelected: emp.id === selectedId,
        isHovered: false,
        isMovePending,
        isDeletePending: deletes.has(emp.id),
      });
    });
  }

  // ── Mode & toolbar actions ─────────────────────────────────────────

  setMode(mode: EditMode): void {
    this.editMode.set(mode);
    this.drawStart = null;
    this.drawRect = null;
    this.dragState = null;
    this.resizeState = null;
    if (this.canvas) {
      this.canvas.style.cursor = mode === 'draw' ? 'crosshair' : 'default';
    }
    this.drawMap();
  }

  onEtageSelected(etageId: string): void {
    this.selectedEtageId.set(etageId);
  }

  // ── Create dialog ──────────────────────────────────────────────────

  openCreateDialog(): void {
    this.createForm.reset({ numero: '' });
    this.createDialogVisible.set(true);
    this.cdr.detectChanges();
  }

  closeCreateDialog(): void {
    this.createDialogVisible.set(false);
    this.drawRect = null;
    this.drawMap();
  }

  confirmCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const rect = this.drawRect!;
    const etageId = this.selectedEtageId();
    const numero: string = this.createForm.value.numero;

    this.pendingCreates.update(list => [
      ...list,
      { tempId: `new_${Date.now()}`, etageId, numero, coordonnees: { ...rect } },
    ]);
    this.createDialogVisible.set(false);
    this.drawRect = null;
    // Switch back to move mode after drawing a slot
    this.setMode('move');
  }

  // ── Edit dialog ────────────────────────────────────────────────────

  openEditDialog(): void {
    const sel = this.selectedEmplacement();
    if (!sel) return;
    this.editForm.reset({
      numero: sel.numero,
      x: sel.coordonnees.x,
      y: sel.coordonnees.y,
      width: sel.coordonnees.width,
      height: sel.coordonnees.height,
    });
    this.editDialogVisible.set(true);
    this.cdr.detectChanges();
  }

  closeEditDialog(): void {
    this.editDialogVisible.set(false);
  }

  confirmEdit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const id = this.selectedId()!;
    const { numero, x, y, width, height } = this.editForm.value;
    const newCoords: EmplacementCoordonnees = { x, y, width, height };

    const isNew = this.pendingCreates().some(c => c.tempId === id);
    if (isNew) {
      this.pendingCreates.update(list =>
        list.map(c => c.tempId === id ? { ...c, numero, coordonnees: newCoords } : c)
      );
    } else {
      this.pendingMoves.update(map => { const next = new Map(map); next.set(id, newCoords); return next; });
      // If numero changed for existing slot, track it too (handled via update payload)
      const server = this.serverEmplacements().find(e => e._id === id);
      if (server && server.numero !== numero) {
        // Store as a special marker — we'll send numero in update payload
        this.pendingMoves.update(map => { const next = new Map(map); next.set(id, newCoords); return next; });
      }
    }

    this.editDialogVisible.set(false);
    this.drawMap();
  }

  // ── Delete ─────────────────────────────────────────────────────────

  openDeleteDialog(): void {
    const sel = this.selectedEmplacement();
    if (!sel) return;
    this.deletingLabel.set(sel.numero);
    this.deleteDialogVisible.set(true);
    this.cdr.detectChanges();
  }

  closeDeleteDialog(): void {
    this.deleteDialogVisible.set(false);
  }

  undoDelete(id: string): void {
    this.pendingDeletes.update(s => { const n = new Set(s); n.delete(id); return n; });
    this.drawMap();
  }

  confirmDelete(): void {
    const id = this.selectedId();
    if (!id) return;

    const isNew = this.pendingCreates().some(c => c.tempId === id);
    if (isNew) {
      this.pendingCreates.update(list => list.filter(c => c.tempId !== id));
    } else {
      this.pendingDeletes.update(set => { const next = new Set(set); next.add(id); return next; });
    }

    this.selectedId.set(null);
    this.deleteDialogVisible.set(false);
    this.cdr.detectChanges();
  }

  // ── Pending changes ────────────────────────────────────────────────

  clearPending(): void {
    this.pendingMoves.set(new Map());
    this.pendingCreates.set([]);
    this.pendingDeletes.set(new Set());
  }

  cancelAll(): void {
    this.clearPending();
    this.selectedId.set(null);
    this.drawRect = null;
    this.drawStart = null;
    this.dragState = null;
    this.resizeState = null;
    this.drawMap();
  }

  saveAll(): void {
    if (!this.hasPendingChanges()) return;
    this.saving.set(true);

    const etageId = this.selectedEtageId();
    const moves = this.pendingMoves();
    const creates = this.pendingCreates();
    const deletes = this.pendingDeletes();

    // Build an array of observables to execute sequentially
    const updateOps = [...moves.entries()].map(([id, coords]) => {
      const server = this.serverEmplacements().find(e => e._id === id);
      return this.emplacementService.update(id, { coordonnees: coords, numero: server?.numero });
    });

    const createOps = creates.map(c =>
      this.emplacementService.create({
        etageId: c.etageId,
        numero: c.numero,
        coordonnees: c.coordonnees,
      })
    );

    const deleteOps = [...deletes].map(id => this.emplacementService.delete(id));

    const allOps: Observable<unknown>[] = [...updateOps, ...createOps, ...deleteOps];

    if (allOps.length === 0) {
      this.saving.set(false);
      return;
    }

    forkJoin(allOps).subscribe({
      next: () => {
        this.saving.set(false);
        this.clearPending();
        this.selectedId.set(null);
        this.loadEmplacements(etageId);
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Modifications enregistrées' });
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Une erreur est survenue lors de la sauvegarde' });
      },
    });
  }
}
