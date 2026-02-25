// CentreCommercial has no references, so Base and Populated are the same
export interface CentreCommercialBase {
  _id: string;
  nom: string;
  description: string;
  adresse: string;
  heureOuverture: string; // Format: "HH:mm"
  heureFermeture: string; // Format: "HH:mm"
  updatedAt: Date;
}

// For consistency, we use the same type for both
export type CentreCommercial = CentreCommercialBase;
