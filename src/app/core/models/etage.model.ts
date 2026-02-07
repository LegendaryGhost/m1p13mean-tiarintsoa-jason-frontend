export interface Etage {
  _id: string;
  nom: string; // Ex: "Rez-de-chaussée"
  niveau: number; // 0, 1
  planImage: string; // URL of the plan image
  createdAt: Date;
  updatedAt: Date;
}
