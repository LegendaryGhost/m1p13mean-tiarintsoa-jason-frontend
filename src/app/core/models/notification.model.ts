import { UserBase } from './user.model';
import { BoutiquePopulated } from './boutique.model';

// Base interface with unpopulated references (IDs only)
export interface NotificationBase {
  _id: string;
  userId: string; // Reference to User (recipient)
  boutiqueId: string; // Reference to Boutique
  type: 'nouvelle_promo' | 'boutique_modifiee';
  titre: string;
  message: string;
  lu: boolean; // Read status
  createdAt: Date;
}

// Populated interface with full objects
export interface NotificationPopulated {
  _id: string;
  userId: UserBase; // Populated User reference
  boutiqueId: BoutiquePopulated; // Populated Boutique reference
  type: 'nouvelle_promo' | 'boutique_modifiee';
  titre: string;
  message: string;
  lu: boolean;
  createdAt: Date;
}

// Generic type that can be either
export type Notification = NotificationBase | NotificationPopulated;

// Type guard for checking if notification is populated
export function isNotificationPopulated(notification: Notification): notification is NotificationPopulated {
  return typeof notification.userId !== 'string';
}
