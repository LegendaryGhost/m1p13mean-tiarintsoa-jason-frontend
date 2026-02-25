import { BoutiquePopulated } from './boutique.model';

// Base interface with unpopulated references (IDs only)
export interface ProduitBase {
  _id: string;
  boutiqueId: string; // Reference to Boutique
  nom: string;
  description: string;
  prix: number;
  image: string; // Image URL
  enAvant: boolean; // Featured product
  createdAt: Date;
  updatedAt: Date;
}

// Populated interface with full objects
export interface ProduitPopulated {
  _id: string;
  boutiqueId: BoutiquePopulated; // Populated Boutique reference
  nom: string;
  description: string;
  prix: number;
  image: string;
  enAvant: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Generic type that can be either
export type Produit = ProduitBase | ProduitPopulated;

// Type guard for checking if produit is populated
export function isProduitPopulated(produit: Produit): produit is ProduitPopulated {
  return typeof produit.boutiqueId !== 'string';
}
