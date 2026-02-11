export interface Categorie {
  _id: string;
  nom: string;
  description: string;
  icon: string; // PrimeIcon class name (e.g., 'pi-shopping-bag')
  couleur: string; // Hex color for category tags
  createdAt: Date;
  updatedAt: Date;
}
