export interface Promotion {
  _id: string;
  boutiqueId: string; // Reference to Boutique
  titre: string;
  description: string;
  dateDebut: Date;
  dateFin: Date;
  image: string; // Promotion banner/image URL
  reduction?: number; // Discount percentage (optional)
  createdAt: Date;
  updatedAt: Date;
}
