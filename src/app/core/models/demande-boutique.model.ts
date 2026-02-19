export interface DemandeBoutique {
  _id: string;
  nom: string;
  description: string;
  categorieId: string; // Reference to Categorie
  logo: string | null;
  emplacementSouhaiteId: string | null; // Reference to Emplacement (optional)
  contactNom: string;
  contactPrenom: string;
  contactEmail: string;
  contactTelephone: string;
  statut: 'en_attente' | 'acceptee' | 'refusee';
  motifRefus: string | null;
  createdAt: Date;
  updatedAt: Date;
}
