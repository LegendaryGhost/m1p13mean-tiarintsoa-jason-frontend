// Base interface with unpopulated references (IDs only)
export interface UserBase {
  _id: string;
  email: string;
  password?: string; // Optional since it won't be sent from backend in most cases
  role: 'admin' | 'boutique' | 'acheteur';
  nom: string;
  prenom: string;
  isApproved?: boolean;
  approvedAt?: Date;
  approvedBy?: string; // Reference to User who approved
  createdAt: Date;
  updatedAt: Date;
}

// Populated interface with full objects
export interface UserPopulated {
  _id: string;
  email: string;
  password?: string;
  role: 'admin' | 'boutique' | 'acheteur';
  nom: string;
  prenom: string;
  isApproved?: boolean;
  approvedAt?: Date;
  approvedBy?: UserBase; // Populated User reference
  createdAt: Date;
  updatedAt: Date;
}

// Generic type that can be either
export type User = UserBase | UserPopulated;

// Type guard for checking if user is populated
export function isUserPopulated(user: User): user is UserPopulated {
  return user.approvedBy != null && typeof user.approvedBy !== 'string';
}
