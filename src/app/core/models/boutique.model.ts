import { UserBase } from './user.model';
import { CategorieBase } from './categorie.model';

// Base interface with unpopulated references (IDs only)
export interface BoutiqueBase {
  _id: string;
  userId: string; // Reference to User (owner)
  nom: string;
  description: string;
  categorieId: string; // Reference to Categorie
  logo: string; // Logo URL
  images: string[]; // Array of image URLs
  heureOuverture: string; // Format: "HH:mm"
  heureFermeture: string; // Format: "HH:mm"
  joursOuverture: string[]; // Ex: ["lundi", "mardi", ...]
  statut: 'en_attente' | 'validee' | 'rejetee';
  createdAt: Date;
  updatedAt: Date;
}

// Populated interface with full objects
export interface BoutiquePopulated {
  _id: string;
  userId: UserBase; // Populated User reference
  nom: string;
  description: string;
  categorieId: CategorieBase; // Populated Categorie reference
  logo: string;
  images: string[];
  heureOuverture: string;
  heureFermeture: string;
  joursOuverture: string[];
  statut: 'en_attente' | 'validee' | 'rejetee';
  createdAt: Date;
  updatedAt: Date;
}

// Generic type that can be either
export type Boutique = BoutiqueBase | BoutiquePopulated;

// Type guard for checking if boutique is populated
export function isBoutiquePopulated(boutique: Boutique): boutique is BoutiquePopulated {
  return typeof boutique.categorieId !== 'string';
}

// Type guard for checking if user is populated
export function hasBoutiquePopulatedUser(boutique: Boutique): boutique is BoutiquePopulated {
  return typeof boutique.userId !== 'string';
}
