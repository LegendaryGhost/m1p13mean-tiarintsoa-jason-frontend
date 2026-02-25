// Etage has no references, so Base and Populated are the same
export interface EtageBase {
  _id: string;
  nom: string; // Ex: "Rez-de-chaussée"
  niveau: number; // 0, 1
  planImage: string; // URL of the plan image
  createdAt: Date;
  updatedAt: Date;
}

// For consistency, we use the same type for both
export type Etage = EtageBase;
