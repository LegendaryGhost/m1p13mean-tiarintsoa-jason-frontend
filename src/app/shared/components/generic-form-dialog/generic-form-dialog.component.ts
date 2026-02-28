import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import { FieldDef } from './generic-form-dialog.types';

@Component({
  selector: 'app-generic-form-dialog',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgTemplateOutlet,
    ButtonModule,
    CheckboxModule,
    ColorPickerModule,
    DatePickerModule,
    DialogModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputNumberModule,
    InputTextModule,
    RadioButtonModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './generic-form-dialog.component.html',
  styleUrl: './generic-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericFormDialogComponent implements OnDestroy {
  form = input<FormGroup | null>(null);
  fields = input<FieldDef[]>([]);
  visible = input(false);
  title = input('');
  saving = input(false);
  saveLabel = input('Enregistrer');
  saveIcon = input('pi-check');

  visibleChange = output<boolean>();
  save = output<void>();
  cancel = output<void>();

  /** Color picker values — stripped hex (without #) keyed by field key */
  colorPickerValues = signal<Record<string, string>>({});

  /**
   * Groups fields by rowGroup. Fields without a rowGroup get their own
   * single-item group. Returns an array of rows, each row being an
   * array of FieldDefs.
   */
  fieldRows = computed<FieldDef[][]>(() => {
    const rows: FieldDef[][] = [];
    const grouped = new Map<string, FieldDef[]>();

    for (const field of this.fields()) {
      const key = field.rowGroup ?? `__solo__${field.key}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(field);
    }

    for (const group of grouped.values()) {
      rows.push(group);
    }
    return rows;
  });

  private colorSub?: Subscription;

  constructor() {
    effect(() => {
      const f = this.form();
      this.colorSub?.unsubscribe();
      if (!f) return;
      this.syncColorPickerValues(f);
      this.colorSub = f.valueChanges.subscribe(() => this.syncColorPickerValues(f));
    });
  }

  ngOnDestroy() {
    this.colorSub?.unsubscribe();
  }

  private syncColorPickerValues(form: FormGroup): void {
    const colorFields = this.fields().filter((fd) => fd.type === 'color');
    const map: Record<string, string> = {};
    for (const fd of colorFields) {
      const val: string = form.get(fd.key)?.value ?? '#1976D2';
      map[fd.key] = /^#[0-9A-Fa-f]{6}$/i.test(val) ? val.slice(1) : '1976D2';
    }
    this.colorPickerValues.set({ ...map });
  }

  onColorPickerChange(key: string, hex: string): void {
    const normalized = hex.startsWith('#') ? hex : `#${hex}`;
    const ctrl = this.form()?.get(key);
    if (ctrl) {
      ctrl.setValue(normalized, { emitEvent: true });
      ctrl.markAsDirty();
    }
  }

  onDialogHide(): void {
    this.visibleChange.emit(false);
    this.cancel.emit();
  }

  onSave(): void {
    this.save.emit();
  }

  onCancel(): void {
    this.visibleChange.emit(false);
    this.cancel.emit();
  }

  isFieldInvalid(key: string): boolean {
    const ctrl = this.form()?.get(key);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  getFieldError(key: string): string {
    const ctrl = this.form()?.get(key);
    if (!ctrl) return '';
    if (ctrl.hasError('required')) return 'Ce champ est requis.';
    if (ctrl.hasError('minlength')) {
      const min = ctrl.getError('minlength')?.requiredLength;
      return `Minimum ${min} caractères.`;
    }
    if (ctrl.hasError('maxlength')) {
      const max = ctrl.getError('maxlength')?.requiredLength;
      return `Maximum ${max} caractères.`;
    }
    if (ctrl.hasError('pattern')) return 'Format invalide.';
    if (ctrl.hasError('min')) return `Valeur minimale : ${ctrl.getError('min')?.min}.`;
    if (ctrl.hasError('max')) return `Valeur maximale : ${ctrl.getError('max')?.max}.`;
    return 'Valeur invalide.';
  }
}
