export interface User {
  _id: string;
  email: string;
  password?: string; // Optional since it won't be sent from backend in most cases
  role: 'admin' | 'boutique' | 'acheteur';
  nom: string;
  prenom: string;
  favoris?: string[]; // Array of boutique IDs (for acheteur role)
  createdAt: Date;
  updatedAt: Date;
}
