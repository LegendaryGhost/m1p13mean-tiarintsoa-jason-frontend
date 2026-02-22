# Model & Service Architecture Patterns

This document defines the standard patterns for data models and services in this Angular application.

## Model Structure: Base/Populated Pattern

All models follow a consistent pattern to handle Mongoose populated references from the backend API.

### Pattern Overview

Each model defines three types:

1. **`*Base`** - Interface with unpopulated references (string IDs only)
2. **`*Populated`** - Interface with populated references (nested objects)
3. **Union Type** - Type alias that can be either Base or Populated
4. **Type Guards** - Functions to check which variant you have at runtime

### When to Use Each Type

- **Base Types**: Use for forms, create, and update operations
  - Example: `BoutiqueBase`, `EmplacementBase`
  - All foreign key references are strings (IDs)

- **Populated Types**: Use for display lists and detail views
  - Example: `BoutiquePopulated`, `EmplacementPopulated`
  - Foreign key references are full nested objects

- **Union Types**: Use when the data source is ambiguous
  - Example: `Boutique`, `Emplacement`
  - Can be either Base or Populated

### Model Examples

#### Model with No References

```typescript
// For models without foreign key references
export interface CategorieBase {
  _id: string;
  nom: string;
  description: string;
  icon: string;
  couleur: string;
  createdAt: Date;
  updatedAt: Date;
}

// Base and Populated are the same
export type Categorie = CategorieBase;
```

#### Model with References

```typescript
import { Categorie, CategorieBase } from './categorie.model';
import { User, UserBase } from './user.model';

// Base interface - IDs only
export interface BoutiqueBase {
  _id: string;
  userId: string; // Reference to User
  nom: string;
  description: string;
  categorieId: string; // Reference to Categorie
  logo: string;
  statut: 'en_attente' | 'validee' | 'rejetee';
  createdAt: Date;
  updatedAt: Date;
}

// Populated interface - nested objects
export interface BoutiquePopulated {
  _id: string;
  userId: UserBase; // Populated User reference
  nom: string;
  description: string;
  categorieId: CategorieBase; // Populated Categorie reference
  logo: string;
  statut: 'en_attente' | 'validee' | 'rejetee';
  createdAt: Date;
  updatedAt: Date;
}

// Union type
export type Boutique = BoutiqueBase | BoutiquePopulated;

// Type guard
export function isBoutiquePopulated(boutique: Boutique): boutique is BoutiquePopulated {
  return typeof boutique.categorieId !== 'string';
}
```

#### Model with Optional References

```typescript
// When a reference is optional
export interface EmplacementBase {
  _id: string;
  etageId: string;
  numero: string;
  statut: 'libre' | 'occupe';
  boutiqueId?: string; // Optional reference
  createdAt: Date;
  updatedAt: Date;
}

export interface EmplacementPopulated {
  _id: string;
  etageId: EtageBase;
  numero: string;
  statut: 'libre' | 'occupe';
  boutiqueId?: BoutiquePopulated; // Optional nested object
  createdAt: Date;
  updatedAt: Date;
}

export type Emplacement = EmplacementBase | EmplacementPopulated;

// Type guard for checking if emplacement is populated
export function isEmplacementPopulated(emplacement: Emplacement): emplacement is EmplacementPopulated {
  return typeof emplacement.etageId !== 'string';
}

// Type guard for checking if optional reference is populated
export function hasPopulatedBoutique(
  emplacement: Emplacement
): emplacement is EmplacementPopulated & { boutiqueId: BoutiquePopulated } {
  return emplacement.boutiqueId != null && typeof emplacement.boutiqueId !== 'string';
}
```

### Type Guard Naming Conventions

- **`is*Populated()`** - Checks if the main entity is populated
- **`hasPopulated*()`** - Checks if a specific optional reference is populated

## Service Architecture: Generic CRUD Service

All data services extend a generic `CrudService` base class to avoid code duplication.

### CrudService Base Class

Location: `src/app/core/services/crud.service.ts`

```typescript
export abstract class CrudService<TBase, TPopulated = TBase> {
  protected apiService = inject(ApiService);
  protected abstract endpoint: string;

  // Returns populated entities for list views
  getAll(): Observable<TPopulated[]>;

  // Returns populated entity for detail views
  getById(id: string): Observable<TPopulated | undefined>;

  // Uses base entity for form data
  create(data: Omit<TBase, '_id' | 'createdAt' | 'updatedAt'>): Observable<TBase>;

  // Uses base entity for form data
  update(id: string, data: Partial<Omit<TBase, '_id' | 'createdAt' | 'updatedAt'>>): Observable<TBase>;

  // Deletes an entity
  delete(id: string): Observable<void>;
}
```

### Creating a Service

#### Service for Entity Without References

```typescript
import { Injectable } from '@angular/core';
import { CategorieBase } from '../models';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root'
})
export class CategorieService extends CrudService<CategorieBase, CategorieBase> {
  protected override endpoint = 'categories';

  // Add custom methods here if needed
}
```

#### Service for Entity With References

```typescript
import { Injectable } from '@angular/core';
import { BoutiqueBase, BoutiquePopulated } from '../models';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root'
})
export class BoutiqueService extends CrudService<BoutiqueBase, BoutiquePopulated> {
  protected override endpoint = 'boutiques';

  // Add custom methods here
  getBoutiquesByCategorie(categorieId: string): Observable<BoutiquePopulated[]> {
    return this.apiService.get<ApiResponse<BoutiquePopulated[]>>(`boutiques/categorie/${categorieId}`).pipe(
      map(response => response.data)
    );
  }
}
```

### Service Method Usage

```typescript
// In a component class

// List view - get populated data
boutiques = signal<BoutiquePopulated[]>([]);

ngOnInit() {
  this.boutiqueService.getAll().subscribe(data => {
    this.boutiques.set(data);
    // Access nested objects: data[0].categorieId.nom
  });
}

// Detail view - get populated data
boutique = signal<BoutiquePopulated | null>(null);

loadBoutique(id: string) {
  this.boutiqueService.getById(id).subscribe(data => {
    this.boutique.set(data ?? null);
    // Access nested: data.categorieId.nom
  });
}

// Create form - use base data
createForm = new FormGroup({
  nom: new FormControl(''),
  categorieId: new FormControl(''), // String ID
  userId: new FormControl('') // String ID
});

onSubmit() {
  const formData: Omit<BoutiqueBase, '_id' | 'createdAt' | 'updatedAt'> = {
    nom: this.createForm.value.nom!,
    categorieId: this.createForm.value.categorieId!, // Pass ID string
    userId: this.currentUserId,
    // ... other fields
  };

  this.boutiqueService.create(formData).subscribe(result => {
    // result is BoutiqueBase with IDs
    console.log('Created boutique:', result);
  });
}

// Update form - use partial base data
onUpdate(id: string) {
  const updateData: Partial<Omit<BoutiqueBase, '_id' | 'createdAt' | 'updatedAt'>> = {
    nom: this.editForm.value.nom,
    categorieId: this.editForm.value.categorieId // Pass ID string
  };

  this.boutiqueService.update(id, updateData).subscribe(result => {
    // result is BoutiqueBase
    console.log('Updated boutique:', result);
  });
}
```

### Using Type Guards in Components

```typescript
// Check if entity is populated
displayBoutique(boutique: Boutique) {
  if (isBoutiquePopulated(boutique)) {
    // TypeScript knows boutique.categorieId is CategorieBase
    console.log('Categorie:', boutique.categorieId.nom);
    console.log('Owner:', boutique.userId.email);
  } else {
    // TypeScript knows boutique.categorieId is string
    console.log('Categorie ID:', boutique.categorieId);
  }
}

// Check if optional reference is populated
displayEmplacement(emplacement: Emplacement) {
  if (hasPopulatedBoutique(emplacement)) {
    // TypeScript knows boutiqueId exists and is BoutiquePopulated
    console.log('Shop name:', emplacement.boutiqueId.nom);
  } else {
    console.log('No boutique or not populated');
  }
}
```

## Best Practices

### DO ✅

- Always use Base types for form models and create/update operations
- Always use Populated types for display data from `getAll()` and `getById()`
- Use type guards when working with union types
- Define the `endpoint` property in each service class
- Add custom methods to services when needed for specific queries
- Keep form data flat with ID strings, not nested objects

### DON'T ❌

- Don't use Populated types in form submissions
- Don't pass nested objects when the API expects IDs
- Don't mix Base and Populated types inconsistently
- Don't skip defining type guards for models with references
- Don't duplicate CRUD methods across services
- Don't assume a reference is populated without checking with type guards

## Migration Guide

When adding a new model or service:

1. **Create the model** following the Base/Populated pattern
2. **Add type guards** if the model has references
3. **Export** all types from `models/index.ts`
4. **Create a service** extending `CrudService<Base, Populated>`
5. **Define the endpoint** property
6. **Add custom methods** as needed
7. **Update components** to use Base for forms and Populated for displays

## API Contract

The backend API should:

- Return **unpopulated** (Base) entities for `POST` (create) and `PUT` (update) responses
- Return **populated** entities for `GET` all and `GET` by ID responses
- Use Mongoose `.populate()` consistently for list and detail endpoints
- Never populate in create/update responses to maintain consistency
