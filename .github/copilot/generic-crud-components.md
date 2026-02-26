# Generic CRUD Components

Two reusable shared components **must** be used for all CRUD list/form UI. Never build ad-hoc tables or dialog forms — always use these instead.

## `GenericListComponent` — `<app-generic-list>`

Path: `src/app/shared/components/generic-list/`

Use it for every data table. Configure via a `ListConfig<T>` object:

```typescript
import { ListConfig } from '../../../shared/components/generic-list/generic-list.types';

listConfig: ListConfig<MyEntity> = {
  columns: [
    { field: 'nom', header: 'Nom', sortable: true, cellType: 'text' },
    { field: 'couleur', header: 'Couleur', cellType: 'color', hexField: 'couleur' },
    { field: 'icon', header: 'Icône', cellType: 'icon', iconField: 'icon', colorField: 'couleur' },
    { field: 'statut', header: 'Statut', cellType: 'badge',
      badgeValue: (row) => row.statut, badgeSeverity: (row) => 'warn' },
    { field: 'createdAt', header: 'Créé le', cellType: 'date' },
  ],
  actions: [
    { icon: 'pi-pencil', tooltip: 'Modifier', action: (row) => this.openEdit(row) },
    { icon: 'pi-trash', severity: 'danger', tooltip: 'Supprimer', action: (row) => this.delete(row) },
  ],
  paginator: true,
  rows: 10,
  emptyMessage: 'Aucun élément',
  emptyIcon: 'pi-inbox',
};
```

**Available `cellType` values:** `text` (default) · `badge` · `color` · `icon` · `date` · `custom` (requires `col.template: TemplateRef`)

**Template:**
```html
<app-generic-list [data]="items()" [loading]="loading()" [config]="listConfig">
  <!-- Optional: button shown in the empty state -->
  <p-button emptyAction label="Créer" icon="pi pi-plus" (onClick)="openCreate()" />
</app-generic-list>
```

For entirely custom action cells, project an `#actionsTemplate` `ng-template` as a `@ContentChild`.

---

## `GenericFormDialogComponent` — `<app-generic-form-dialog>`

Path: `src/app/shared/components/generic-form-dialog/`

Use it for every create/edit dialog. The parent owns the `FormGroup`; the component handles rendering, validation messages, and the color picker state.

```typescript
import { FieldDef } from '../../../shared/components/generic-form-dialog/generic-form-dialog.types';

form = this.fb.group({
  nom: ['', [Validators.required, Validators.minLength(2)]],
  couleur: ['#1976D2', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
});

formFields: FieldDef[] = [
  { key: 'nom',    label: 'Nom',     type: 'text',   required: true, placeholder: 'Ex. : Valeur' },
  { key: 'couleur', label: 'Couleur', type: 'color',  required: true, rowGroup: 'row1' },
];
```

**Available `type` values:** `text` · `textarea` · `select` · `color` · `number` · `date` · `checkbox` · `radio`

Fields sharing the same non-null `rowGroup` string are rendered side-by-side.

**Template:**
```html
<app-generic-form-dialog
  [form]="form"
  [fields]="formFields"
  [visible]="dialogVisible()"
  [title]="isEditing() ? 'Modifier' : 'Créer'"
  [saving]="saving()"
  [saveLabel]="isEditing() ? 'Enregistrer' : 'Créer'"
  [saveIcon]="isEditing() ? 'pi-check' : 'pi-plus'"
  (visibleChange)="$event ? null : closeDialog()"
  (save)="save()"
  (cancel)="closeDialog()"
>
  <!-- Optional extra content (e.g. a preview) projected after the fields -->
</app-generic-form-dialog>
```

---

## Rules

- Import both from `src/app/shared/components/` (or directly from their subfolder).
- The component importing them must list `GenericListComponent` and/or `GenericFormDialogComponent` in its `imports` array.
- Do **not** replicate table markup (`p-table`, `p-sortIcon`, action button rows) or dialog form markup (`p-dialog` + manual field loops) in feature components.
