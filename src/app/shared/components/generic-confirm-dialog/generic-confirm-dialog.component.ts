import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-generic-confirm-dialog',
  imports: [ButtonModule, DialogModule],
  templateUrl: './generic-confirm-dialog.component.html',
  styleUrl: './generic-confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericConfirmDialogComponent {
  visible = input(false);
  header = input('Confirmation');
  message = input('');
  icon = input('pi pi-exclamation-triangle');
  /** PrimeNG button severity for the confirm button */
  severity = input<'danger' | 'warn' | 'success' | 'info' | 'secondary' | 'contrast'>('danger');
  confirmLabel = input('Confirmer');
  confirmIcon = input('pi-check');
  cancelLabel = input('Annuler');
  loading = input(false);

  visibleChange = output<boolean>();
  confirm = output<void>();
  cancel = output<void>();

  onHide(): void {
    this.visibleChange.emit(false);
    this.cancel.emit();
  }

  onCancel(): void {
    this.visibleChange.emit(false);
    this.cancel.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }
}
