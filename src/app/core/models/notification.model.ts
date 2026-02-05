export interface Notification {
  _id: string;
  userId: string; // Reference to User (recipient)
  boutiqueId: string; // Reference to Boutique
  type: 'nouvelle_promo' | 'boutique_modifiee';
  titre: string;
  message: string;
  lu: boolean; // Read status
  createdAt: Date;
}
