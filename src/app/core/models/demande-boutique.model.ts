import { BoutiqueBase } from './boutique.model';
import { EmplacementPopulated } from './emplacement.model';

/**
 * DemandeBoutique — slot location request submitted by an authenticated boutique account.
 * boutiqueId is resolved server-side; only emplacementSouhaiteId is sent by the client.
 */

// Base interface: all FK references as string IDs
export interface DemandeBoutiqueBase {
  _id: string;
  boutiqueId: string;             // Reference to Boutique (provided by the client)
  emplacementSouhaiteId: string;  // Reference to Emplacement (required)
  dateDebutSouhaitee: Date;       // Desired rental start date
  dateFinSouhaitee: Date | null;  // Desired rental end date (optional)
  statut: 'en_attente' | 'acceptee' | 'refusee';
  motifRefus: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Populated interface: FK references replaced by full objects
export interface DemandeBoutiquePopulated {
  _id: string;
  boutiqueId: BoutiqueBase;
  emplacementSouhaiteId: EmplacementPopulated;
  dateDebutSouhaitee: Date;
  dateFinSouhaitee: Date | null;
  statut: 'en_attente' | 'acceptee' | 'refusee';
  motifRefus: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Generic union type
export type DemandeBoutique = DemandeBoutiqueBase | DemandeBoutiquePopulated;

// Type guard: checks if the demande has populated references
export function isDemandeBoutiquePopulated(demande: DemandeBoutique): demande is DemandeBoutiquePopulated {
  return typeof demande.boutiqueId !== 'string';
}

// Type guard: checks if emplacement is populated
export function hasPopulatedEmplacement(
  demande: DemandeBoutique
): demande is DemandeBoutiquePopulated {
  return isDemandeBoutiquePopulated(demande) && typeof demande.emplacementSouhaiteId !== 'string';
}

/** Payload sent by the shop client when creating a request */
export interface CreateDemandePayload {
  boutiqueId: string;            // Which of the user's boutiques is requesting the slot
  emplacementSouhaiteId: string;
  dateDebutSouhaitee: string;    // ISO 8601 date string
  dateFinSouhaitee?: string;     // ISO 8601 date string (optional)
}
