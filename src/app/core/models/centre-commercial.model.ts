export interface CentreCommercial {
  _id: string;
  nom: string;
  description: string;
  adresse: string;
  heureOuverture: string; // Format: "HH:mm"
  heureFermeture: string; // Format: "HH:mm"
  updatedAt: Date;
}
