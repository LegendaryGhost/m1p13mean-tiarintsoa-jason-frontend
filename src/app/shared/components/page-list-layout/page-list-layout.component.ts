import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';

/**
 * Generic page layout wrapper for list pages.
 *
 * Usage:
 * ```html
 * <app-page-list-layout
 *   icon="pi-list"
 *   title="My List"
 *   [subtitle]="items().length + ' item(s)'"
 *   [loading]="loading()"
 *   (refresh)="load()">
 *
 *   <!-- Optional: extra header buttons -->
 *   <ng-container headerActions>
 *     <p-button label="Nouveau" icon="pi pi-plus" (onClick)="open()" />
 *   </ng-container>
 *
 *   <!-- Main content (list) -->
 *   <app-generic-list ... />
 *
 *   <!-- Optional: dialogs / content outside the card -->
 *   <ng-container extraContent>
 *     <app-generic-form-dialog ... />
 *   </ng-container>
 * </app-page-list-layout>
 * ```
 */
@Component({
  selector: 'app-page-list-layout',
  imports: [ButtonModule, CardModule, ToastModule],
  templateUrl: './page-list-layout.component.html',
  styleUrl: './page-list-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageListLayoutComponent {
  /** PrimeNG icon name without the `pi` prefix, e.g. `'pi-list'` */
  icon = input.required<string>();
  title = input.required<string>();
  /** Optional count / description shown below the title */
  subtitle = input<string>('');
  /** Passed to the refresh button's [loading] binding */
  loading = input(false);
  /** Emitted when the user clicks the "Actualiser" button */
  refresh = output<void>();
}
