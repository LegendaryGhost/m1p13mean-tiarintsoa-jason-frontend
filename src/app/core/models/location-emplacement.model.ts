import { BoutiquePopulated } from './boutique.model';
import { EmplacementBase } from './emplacement.model';

// Base interface with unpopulated references (IDs only)
export interface LocationEmplacementBase {
  _id: string;
  demandeId: string;
  boutiqueId: string;
  emplacementId: string;
  userId: string;
  dateDebut: Date;
  dateFin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Populated interface with full objects
export interface LocationEmplacementPopulated {
  _id: string;
  demandeId: string;
  boutiqueId: BoutiquePopulated;
  emplacementId: EmplacementBase;
  userId: string;
  dateDebut: Date;
  dateFin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Generic type that can be either
export type LocationEmplacement = LocationEmplacementBase | LocationEmplacementPopulated;

// Type guard: checks if the location is fully populated
export function isLocationEmplacementPopulated(
  location: LocationEmplacement
): location is LocationEmplacementPopulated {
  return typeof location.boutiqueId !== 'string';
}

// Type guard: checks that boutiqueId is a populated BoutiquePopulated object
export function hasPopulatedLocationBoutique(
  location: LocationEmplacement
): location is LocationEmplacementPopulated {
  return location.boutiqueId != null && typeof location.boutiqueId !== 'string';
}
