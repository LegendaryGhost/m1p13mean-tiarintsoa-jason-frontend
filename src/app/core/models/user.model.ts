export interface User {
  _id: string;
  email: string;
  password?: string; // Optional since it won't be sent from backend in most cases
  role: 'admin' | 'boutique' | 'acheteur';
  nom: string;
  prenom: string;
  createdAt: Date;
  updatedAt: Date;
}
