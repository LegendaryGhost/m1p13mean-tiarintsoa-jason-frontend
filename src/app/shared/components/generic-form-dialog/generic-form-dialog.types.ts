export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'color'
  | 'number'
  | 'date'
  | 'checkbox'
  | 'radio';

export interface SelectOption {
  label: string;
  value: any;
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
}
