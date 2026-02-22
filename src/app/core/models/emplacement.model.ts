import { BoutiquePopulated } from './boutique.model';
import { EtageBase } from './etage.model';

export interface EmplacementCoordonnees {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Base interface with unpopulated references (IDs only)
export interface EmplacementBase {
  _id: string;
  etageId: string; // Reference to Etage
  numero: string; // Location number/name
  coordonnees: EmplacementCoordonnees; // Clickable zone coordinates
  statut: 'libre' | 'occupe';
  boutiqueId?: string; // Reference to Boutique (if occupied)
  createdAt: Date;
  updatedAt: Date;
}

// Populated interface with full objects
export interface EmplacementPopulated {
  _id: string;
  etageId: EtageBase; // Populated Etage reference
  numero: string;
  coordonnees: EmplacementCoordonnees;
  statut: 'libre' | 'occupe';
  boutiqueId?: BoutiquePopulated; // Populated Boutique reference (if occupied)
  createdAt: Date;
  updatedAt: Date;
}

// Generic type that can be either
export type Emplacement = EmplacementBase | EmplacementPopulated;

// Type guard for checking if emplacement is populated
export function isEmplacementPopulated(emplacement: Emplacement): emplacement is EmplacementPopulated {
  return typeof emplacement.etageId !== 'string';
}

// Type guard for checking if boutique is populated
export function hasPopulatedBoutique(emplacement: Emplacement): emplacement is EmplacementPopulated & { boutiqueId: BoutiquePopulated } {
  return emplacement.boutiqueId != null && typeof emplacement.boutiqueId !== 'string';
}
