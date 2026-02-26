import { TemplateRef } from '@angular/core';

export type CellType = 'text' | 'badge' | 'color' | 'icon' | 'date' | 'custom';

export interface ColumnDef<T = any> {
  /** The property path to read from a row object, supports dot notation */
  field: string;
  header: string;
  sortable?: boolean;
  cellType?: CellType;
  width?: string;

  // For 'badge' cell type
  badgeSeverity?: (row: T) => 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;
  badgeValue?: (row: T) => string;

  // For 'icon' cell type: field holding the icon class, field holding the color
  iconField?: string;
  colorField?: string;

  // For 'color' cell type: which field contains the hex color (defaults to `field`)
  hexField?: string;

  // For 'custom' cell type
  template?: TemplateRef<{ $implicit: T }>;
}

export interface RowAction<T = any> {
  icon: string;
  severity?: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';
  tooltip: string;
  action: (row: T) => void;
  visible?: (row: T) => boolean;
}

export interface ListConfig<T = any> {
  columns: ColumnDef<T>[];
  /** Config-driven actions rendered in the default actions column */
  actions?: RowAction<T>[];
  paginator?: boolean;
  rows?: number;
  rowsPerPageOptions?: number[];
  emptyMessage?: string;
  emptyIcon?: string;
}
