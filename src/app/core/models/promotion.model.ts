import { BoutiquePopulated } from './boutique.model';

// Base interface with unpopulated references (IDs only)
export interface PromotionBase {
  _id: string;
  boutiqueId: string; // Reference to Boutique
  titre: string;
  description: string;
  dateDebut: Date;
  dateFin: Date;
  image: string; // Promotion banner/image URL
  reduction?: number; // Discount percentage (optional)
  createdAt: Date;
  updatedAt: Date;
}

// Populated interface with full objects
export interface PromotionPopulated {
  _id: string;
  boutiqueId: BoutiquePopulated; // Populated Boutique reference
  titre: string;
  description: string;
  dateDebut: Date;
  dateFin: Date;
  image: string;
  reduction?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Generic type that can be either
export type Promotion = PromotionBase | PromotionPopulated;

// Type guard for checking if promotion is populated
export function isPromotionPopulated(promotion: Promotion): promotion is PromotionPopulated {
  return typeof promotion.boutiqueId !== 'string';
}
