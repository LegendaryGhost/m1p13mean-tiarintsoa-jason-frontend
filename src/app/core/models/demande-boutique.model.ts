import { CategorieBase } from './categorie.model';
import { EmplacementPopulated } from './emplacement.model';

// Base interface with unpopulated references (IDs only)
export interface DemandeBoutiqueBase {
  _id: string;
  nom: string;
  description: string;
  categorieId: string; // Reference to Categorie
  logo: string | null;
  emplacementSouhaiteId: string | null; // Reference to Emplacement (optional)
  contactNom: string;
  contactPrenom: string;
  contactEmail: string;
  contactTelephone: string;
  statut: 'en_attente' | 'acceptee' | 'refusee';
  motifRefus: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Populated interface with full objects
export interface DemandeBoutiquePopulated {
  _id: string;
  nom: string;
  description: string;
  categorieId: CategorieBase; // Populated Categorie reference
  logo: string | null;
  emplacementSouhaiteId: EmplacementPopulated | null; // Populated Emplacement reference (optional)
  contactNom: string;
  contactPrenom: string;
  contactEmail: string;
  contactTelephone: string;
  statut: 'en_attente' | 'acceptee' | 'refusee';
  motifRefus: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Generic type that can be either
export type DemandeBoutique = DemandeBoutiqueBase | DemandeBoutiquePopulated;

// Type guard for checking if demande is populated
export function isDemandeBoutiquePopulated(demande: DemandeBoutique): demande is DemandeBoutiquePopulated {
  return typeof demande.categorieId !== 'string';
}

// Type guard for checking if emplacement is populated
export function hasPopulatedEmplacement(demande: DemandeBoutique): demande is DemandeBoutiquePopulated & { emplacementSouhaiteId: EmplacementPopulated } {
  return demande.emplacementSouhaiteId != null && typeof demande.emplacementSouhaiteId !== 'string';
}
