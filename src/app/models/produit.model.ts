export interface Produit {
  _id: string;
  boutiqueId: string; // Reference to Boutique
  nom: string;
  description: string;
  prix: number;
  image: string; // Image URL
  enAvant: boolean; // Featured product
  createdAt: Date;
  updatedAt: Date;
}
