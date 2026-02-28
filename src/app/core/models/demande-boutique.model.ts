import { UserBase } from './user.model';
import { BoutiqueBase } from './boutique.model';
import { CategorieBase } from './categorie.model';
import { EmplacementPopulated } from './emplacement.model';

/**
 * DemandeBoutique — slot location request with all shop info embedded.
 * A Boutique document is only created when the admin accepts the request.
 */

// Base interface: all FK references as string IDs
export interface DemandeBoutiqueBase {
  _id: string;
  userId: string;
  // Embedded shop info
  nomBoutique: string;
  description: string;
  categorieId: string;
  heureOuverture: string;
  heureFermeture: string;
  joursOuverture: string[];
  // Requested slot
  emplacementSouhaiteId: string;
  dateDebutSouhaitee: Date;
  dateFinSouhaitee: Date | null;
  // Decision
  statut: 'en_attente' | 'acceptee' | 'refusee';
  motifRefus: string | null;
  boutiqueId: string | null; // null until accepted
  createdAt: Date;
  updatedAt: Date;
}

// Populated interface: FK references replaced by full objects
export interface DemandeBoutiquePopulated {
  _id: string;
  userId: UserBase;
  // Embedded shop info (categorieId populated in reads)
  nomBoutique: string;
  description: string;
  categorieId: CategorieBase;
  heureOuverture: string;
  heureFermeture: string;
  joursOuverture: string[];
  // Requested slot
  emplacementSouhaiteId: EmplacementPopulated;
  dateDebutSouhaitee: Date;
  dateFinSouhaitee: Date | null;
  // Decision
  statut: 'en_attente' | 'acceptee' | 'refusee';
  motifRefus: string | null;
  boutiqueId: BoutiqueBase | null; // null until accepted
  createdAt: Date;
  updatedAt: Date;
}

// Generic union type
export type DemandeBoutique = DemandeBoutiqueBase | DemandeBoutiquePopulated;

// Type guard: checks if the demande has populated references
export function isDemandeBoutiquePopulated(demande: DemandeBoutique): demande is DemandeBoutiquePopulated {
  return typeof demande.categorieId !== 'string';
}

// Type guard: checks if emplacement is populated
export function hasPopulatedEmplacement(
  demande: DemandeBoutique
): demande is DemandeBoutiquePopulated {
  return isDemandeBoutiquePopulated(demande) && typeof demande.emplacementSouhaiteId !== 'string';
}

/** Payload sent by the shop client when creating a request */
export interface CreateDemandePayload {
  nomBoutique: string;
  description?: string;
  categorieId: string;
  heureOuverture: string;
  heureFermeture: string;
  joursOuverture?: string[];
  emplacementSouhaiteId: string;
  dateDebutSouhaitee: string;    // ISO 8601
  dateFinSouhaitee?: string;     // ISO 8601 (optional)
}
