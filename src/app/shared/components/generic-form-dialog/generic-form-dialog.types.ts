export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'color'
  | 'number'
  | 'date'
  | 'checkbox'
  | 'radio'
  | 'label';

export interface SelectOption {
  label: string;
  value: any;
}

/** Defines a single step in a multi-step dialog. */
export interface StepDef {
  label: string;
  icon?: string;
}

export interface FieldDef {
  /** FormGroup control key */
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  /** For 'select' and 'radio' types */
  options?: SelectOption[];
  /**
   * Fields sharing the same non-null rowGroup are rendered
   * side-by-side in a CSS grid row.
   */
  rowGroup?: string;
  /** For 'textarea' type */
  rows?: number;
  /** For 'number' type */
  min?: number;
  max?: number;
  step?: number;
  /**
   * When the dialog is in multi-step mode, only fields whose
   * `stepIndex` matches the current step are rendered.
   * Fields without `stepIndex` are always rendered (single-step behaviour).
   */
  stepIndex?: number;
}
