import { Boutique } from './boutique.model';

export interface EmplacementCoordonnees {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Emplacement {
  _id: string;
  etageId: string; // Reference to Etage
  numero: string; // Location number/name
  coordonnees: EmplacementCoordonnees; // Clickable zone coordinates
  statut: 'libre' | 'occupe';
  boutiqueId?: string | Boutique; // Reference to Boutique (if occupied) - can be populated
  createdAt: Date;
  updatedAt: Date;
}
