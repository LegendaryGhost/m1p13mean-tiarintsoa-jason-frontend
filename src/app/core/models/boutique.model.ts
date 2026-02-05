export interface Boutique {
  _id: string;
  userId: string; // Reference to User (owner)
  nom: string;
  description: string;
  categorieId: string; // Reference to Categorie
  logo: string; // Logo URL
  images: string[]; // Array of image URLs
  heureOuverture: string; // Format: "HH:mm"
  heureFermeture: string; // Format: "HH:mm"
  joursOuverture: string[]; // Ex: ["lundi", "mardi", ...]
  statut: 'en_attente' | 'validee' | 'refusee';
  createdAt: Date;
  updatedAt: Date;
}
