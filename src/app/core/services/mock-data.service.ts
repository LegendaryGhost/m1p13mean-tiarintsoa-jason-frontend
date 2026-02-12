import { Injectable, signal } from '@angular/core';
import {
  Etage,
  Emplacement,
  Boutique,
  Categorie,
  CentreCommercial
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  // Centre Commercial Data
  private centreCommercialData: CentreCommercial = {
    _id: '1',
    nom: 'La City Ivandry',
    description: 'Là où vous trouverez tout ce dont vous aurez besoin dans votre quotidien',
    adresse: '123 Rue de Commerce, Centre Ville',
    heureOuverture: '09:00',
    heureFermeture: '21:00',
    updatedAt: new Date('2026-02-01')
  };

  // Categories
  private categoriesData: Categorie[] = [
    { _id: '1', nom: 'Fashion & Apparel', description: 'Clothing and accessories', icon: 'pi-shopping-bag', couleur: '#E91E63', createdAt: new Date(), updatedAt: new Date() },
    { _id: '2', nom: 'Electronics', description: 'Technology and gadgets', icon: 'pi-mobile', couleur: '#2196F3', createdAt: new Date(), updatedAt: new Date() },
    { _id: '3', nom: 'Food & Beverage', description: 'Restaurants and cafes', icon: 'pi-shopping-cart', couleur: '#FF9800', createdAt: new Date(), updatedAt: new Date() },
    { _id: '4', nom: 'Beauty & Health', description: 'Cosmetics and wellness', icon: 'pi-heart', couleur: '#9C27B0', createdAt: new Date(), updatedAt: new Date() },
    { _id: '5', nom: 'Home & Living', description: 'Furniture and decor', icon: 'pi-home', couleur: '#4CAF50', createdAt: new Date(), updatedAt: new Date() },
    { _id: '6', nom: 'Sports & Outdoor', description: 'Athletic gear and equipment', icon: 'pi-star', couleur: '#00BCD4', createdAt: new Date(), updatedAt: new Date() }
  ];

  // Etages (Floors)
  private etagesData: Etage[] = [
    {
      _id: 'etage-0',
      nom: 'Rez de chaussée',
      niveau: 0,
      planImage: 'https://placehold.co/1200x800/E8EBF0/616161?text=Ground+Floor',
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-01-15')
    },
    {
      _id: 'etage-1',
      nom: '1er étage',
      niveau: 1,
      planImage: 'https://placehold.co/1200x800/E8EBF0/616161?text=First+Floor',
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-01-15')
    }
  ];

  // Boutiques
  private boutiquesData: Boutique[] = [
    {
      _id: 'boutique-1',
      userId: 'user-1',
      nom: 'Fashion Studio',
      description: 'Trendy clothing for men and women',
      categorieId: '1',
      logo: 'https://placehold.co/200x200/E91E63/FFFFFF?text=FS',
      images: [],
      heureOuverture: '10:00',
      heureFermeture: '20:00',
      joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
      statut: 'validee',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'boutique-2',
      userId: 'user-2',
      nom: 'TechZone',
      description: 'Latest electronics and gadgets',
      categorieId: '2',
      logo: 'https://placehold.co/200x200/2196F3/FFFFFF?text=TZ',
      images: [],
      heureOuverture: '09:00',
      heureFermeture: '21:00',
      joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
      statut: 'validee',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'boutique-3',
      userId: 'user-3',
      nom: 'Café Deluxe',
      description: 'Premium coffee and pastries',
      categorieId: '3',
      logo: 'https://placehold.co/200x200/FF9800/FFFFFF?text=CD',
      images: [],
      heureOuverture: '07:00',
      heureFermeture: '19:00',
      joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
      statut: 'validee',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'boutique-4',
      userId: 'user-4',
      nom: 'Beauty Heaven',
      description: 'Cosmetics and skincare products',
      categorieId: '4',
      logo: 'https://placehold.co/200x200/9C27B0/FFFFFF?text=BH',
      images: [],
      heureOuverture: '10:00',
      heureFermeture: '20:00',
      joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
      statut: 'validee',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'boutique-5',
      userId: 'user-5',
      nom: 'Home Decor Plus',
      description: 'Modern furniture and home accessories',
      categorieId: '5',
      logo: 'https://placehold.co/200x200/4CAF50/FFFFFF?text=HD',
      images: [],
      heureOuverture: '09:30',
      heureFermeture: '20:30',
      joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
      statut: 'validee',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'boutique-6',
      userId: 'user-6',
      nom: 'Sports Arena',
      description: 'Athletic equipment and sportswear',
      categorieId: '6',
      logo: 'https://placehold.co/200x200/00BCD4/FFFFFF?text=SA',
      images: [],
      heureOuverture: '09:00',
      heureFermeture: '21:00',
      joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
      statut: 'validee',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'boutique-7',
      userId: 'user-7',
      nom: 'Luxe Boutique',
      description: 'Premium fashion and accessories',
      categorieId: '1',
      logo: 'https://placehold.co/200x200/E91E63/FFFFFF?text=LB',
      images: [],
      heureOuverture: '10:00',
      heureFermeture: '20:00',
      joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
      statut: 'validee',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'boutique-8',
      userId: 'user-8',
      nom: 'Game Store',
      description: 'Video games and gaming accessories',
      categorieId: '2',
      logo: 'https://placehold.co/200x200/2196F3/FFFFFF?text=GS',
      images: [],
      heureOuverture: '10:00',
      heureFermeture: '21:00',
      joursOuverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
      statut: 'validee',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Emplacements for Ground Floor (3-sided layout: left, bottom, right)
  private emplacementsFloor0: Emplacement[] = [
    // Left side (4 slots)
    { _id: 'emp-0-1', etageId: 'etage-0', numero: 'G-L1', coordonnees: { x: 50, y: 150, width: 120, height: 80 }, statut: 'occupe', boutiqueId: 'boutique-1', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-0-2', etageId: 'etage-0', numero: 'G-L2', coordonnees: { x: 50, y: 250, width: 120, height: 80 }, statut: 'occupe', boutiqueId: 'boutique-2', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-0-3', etageId: 'etage-0', numero: 'G-L3', coordonnees: { x: 50, y: 350, width: 120, height: 80 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-0-4', etageId: 'etage-0', numero: 'G-L4', coordonnees: { x: 50, y: 450, width: 120, height: 80 }, statut: 'occupe', boutiqueId: 'boutique-3', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-0-16', etageId: 'etage-0', numero: 'G-L5', coordonnees: { x: 50, y: 550, width: 120, height: 80 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },

    // Top side (5 slots)
    { _id: 'emp-0-5', etageId: 'etage-0', numero: 'G-B1', coordonnees: { x: 200, y: 50, width: 100, height: 100 }, statut: 'occupe', boutiqueId: 'boutique-4', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-0-6', etageId: 'etage-0', numero: 'G-B2', coordonnees: { x: 320, y: 50, width: 100, height: 100 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-0-7', etageId: 'etage-0', numero: 'G-B3', coordonnees: { x: 440, y: 50, width: 100, height: 100 }, statut: 'occupe', boutiqueId: 'boutique-5', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-0-8', etageId: 'etage-0', numero: 'G-B4', coordonnees: { x: 560, y: 50, width: 100, height: 100 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-0-9', etageId: 'etage-0', numero: 'G-B5', coordonnees: { x: 680, y: 50, width: 100, height: 100 }, statut: 'occupe', boutiqueId: 'boutique-6', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-0-14', etageId: 'etage-0', numero: 'G-B6', coordonnees: { x: 800, y: 50, width: 100, height: 100 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-0-15', etageId: 'etage-0', numero: 'G-B7', coordonnees: { x: 920, y: 50, width: 100, height: 100 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },

    // Right side (4 slots)
    { _id: 'emp-0-10', etageId: 'etage-0', numero: 'G-R1', coordonnees: { x: 1030, y: 150, width: 120, height: 80 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-0-11', etageId: 'etage-0', numero: 'G-R2', coordonnees: { x: 1030, y: 250, width: 120, height: 80 }, statut: 'occupe', boutiqueId: 'boutique-7', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-0-12', etageId: 'etage-0', numero: 'G-R3', coordonnees: { x: 1030, y: 350, width: 120, height: 80 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-0-13', etageId: 'etage-0', numero: 'G-R4', coordonnees: { x: 1030, y: 450, width: 120, height: 80 }, statut: 'occupe', boutiqueId: 'boutique-8', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-0-17', etageId: 'etage-0', numero: 'G-R5', coordonnees: { x: 1030, y: 550, width: 120, height: 80 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
  ];

  // Emplacements for First Floor (3-sided layout: left, bottom, right)
  private emplacementsFloor1: Emplacement[] = [
    // Left side (4 slots)
    { _id: 'emp-1-1', etageId: 'etage-1', numero: 'F1-L1', coordonnees: { x: 50, y: 150, width: 120, height: 80 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-1-2', etageId: 'etage-1', numero: 'F1-L2', coordonnees: { x: 50, y: 250, width: 120, height: 80 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-1-3', etageId: 'etage-1', numero: 'F1-L3', coordonnees: { x: 50, y: 350, width: 120, height: 80 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-1-4', etageId: 'etage-1', numero: 'F1-L4', coordonnees: { x: 50, y: 450, width: 120, height: 80 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-1-16', etageId: 'etage-1', numero: 'F1-L5', coordonnees: { x: 50, y: 550, width: 120, height: 80 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },

    // Top side (5 slots)
    { _id: 'emp-1-5', etageId: 'etage-1', numero: 'F1-B1', coordonnees: { x: 200, y: 50, width: 100, height: 100 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-1-6', etageId: 'etage-1', numero: 'F1-B2', coordonnees: { x: 320, y: 50, width: 100, height: 100 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-1-7', etageId: 'etage-1', numero: 'F1-B3', coordonnees: { x: 440, y: 50, width: 100, height: 100 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-1-8', etageId: 'etage-1', numero: 'F1-B4', coordonnees: { x: 560, y: 50, width: 100, height: 100 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-1-9', etageId: 'etage-1', numero: 'F1-B5', coordonnees: { x: 680, y: 50, width: 100, height: 100 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-1-14', etageId: 'etage-1', numero: 'F1-B6', coordonnees: { x: 800, y: 50, width: 100, height: 100 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-1-15', etageId: 'etage-1', numero: 'F1-B7', coordonnees: { x: 920, y: 50, width: 100, height: 100 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },

    // Right side (4 slots)
    { _id: 'emp-1-10', etageId: 'etage-1', numero: 'F1-R1', coordonnees: { x: 1030, y: 150, width: 120, height: 80 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-1-11', etageId: 'etage-1', numero: 'F1-R2', coordonnees: { x: 1030, y: 250, width: 120, height: 80 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-1-12', etageId: 'etage-1', numero: 'F1-R3', coordonnees: { x: 1030, y: 350, width: 120, height: 80 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-1-13', etageId: 'etage-1', numero: 'F1-R4', coordonnees: { x: 1030, y: 450, width: 120, height: 80 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'emp-1-17', etageId: 'etage-1', numero: 'F1-R5', coordonnees: { x: 1030, y: 550, width: 120, height: 80 }, statut: 'libre', createdAt: new Date(), updatedAt: new Date() },
  ];

  // Signals
  centreCommercial = signal<CentreCommercial>(this.centreCommercialData);
  categories = signal<Categorie[]>(this.categoriesData);
  etages = signal<Etage[]>(this.etagesData);
  boutiques = signal<Boutique[]>(this.boutiquesData);
  emplacements = signal<Emplacement[]>([...this.emplacementsFloor0, ...this.emplacementsFloor1]);
}
