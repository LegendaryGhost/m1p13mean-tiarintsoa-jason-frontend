import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  TemplateRef,
  input,
} from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { ColumnDef, ListConfig, RowAction } from './generic-list.types';

@Component({
  selector: 'app-generic-list',
  imports: [CommonModule, NgTemplateOutlet, TableModule, ButtonModule, TagModule, TooltipModule],
  templateUrl: './generic-list.component.html',
  styleUrl: './generic-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericListComponent<T = any> {
  data = input<T[]>([]);
  loading = input(false);
  config = input.required<ListConfig<T>>();

  /** Optional full override for the actions cell */
  @ContentChild('actionsTemplate') actionsTemplate?: TemplateRef<{ $implicit: T }>;

  getCellValue(row: T, col: ColumnDef<T>): any {
    return (col.field as string).split('.').reduce((obj: any, key) => obj?.[key], row);
  }

  getIconClass(icon: string | undefined): string {
    if (!icon) return 'pi pi-tag';
    return icon.startsWith('pi ') ? icon : `pi ${icon}`;
  }

  formatDate(value: any): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  isActionVisible(action: RowAction<T>, row: T): boolean {
    return action.visible ? action.visible(row) : true;
  }

  getBadgeSeverity(col: ColumnDef<T>, row: T) {
    return col.badgeSeverity ? col.badgeSeverity(row) : undefined;
  }

  getBadgeValue(col: ColumnDef<T>, row: T): string {
    return col.badgeValue ? col.badgeValue(row) : String(this.getCellValue(row, col) ?? '—');
  }

  getIconFromRow(row: T, col: ColumnDef<T>): string {
    const icon = col.iconField
      ? (row as any)[col.iconField]
      : this.getCellValue(row, col);
    return this.getIconClass(icon);
  }

  getColorFromRow(row: T, col: ColumnDef<T>): string {
    return col.colorField ? (row as any)[col.colorField] : this.getCellValue(row, col) ?? '#1976D2';
  }

  getHexFromRow(row: T, col: ColumnDef<T>): string {
    return col.hexField ? (row as any)[col.hexField] : this.getCellValue(row, col) ?? '#1976D2';
  }

  hasActions(): boolean {
    return !!(this.config().actions?.length || this.actionsTemplate);
  }
}
