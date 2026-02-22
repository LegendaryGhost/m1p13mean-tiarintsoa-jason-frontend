// Categorie has no references, so Base and Populated are the same
export interface CategorieBase {
  _id: string;
  nom: string;
  description: string;
  icon: string; // PrimeIcon class name (e.g., 'pi-shopping-bag')
  couleur: string; // Hex color for category tags
  createdAt: Date;
  updatedAt: Date;
}

// For consistency, we use the same type for both
export type Categorie = CategorieBase;
