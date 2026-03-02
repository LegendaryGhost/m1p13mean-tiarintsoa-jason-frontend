import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ProduitBase, ProduitPopulated } from '../models';
import { ApiResponse } from '../models/api-response.interface';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root',
})
export class ProduitService extends CrudService<ProduitBase, ProduitPopulated> {
  protected override endpoint = 'produits';

  /** Produits des boutiques appartenant à l'utilisateur connecté. */
  getMesProduits(): Observable<ProduitPopulated[]> {
    return this.apiService
      .get<ApiResponse<ProduitPopulated[]>>(`${this.endpoint}/mes-produits`)
      .pipe(map((r) => r.data));
  }

  /** Produits d'une boutique donnée (public). */
  getProduitsByBoutique(boutiqueId: string): Observable<ProduitPopulated[]> {
    return this.apiService
      .get<ApiResponse<ProduitPopulated[]>>(`${this.endpoint}/boutique/${boutiqueId}`)
      .pipe(map((r) => r.data));
  }

  /**
   * Crée un produit avec image (multipart/form-data).
   * Le FormData doit contenir tous les champs du produit + le fichier 'image'.
   */
  createWithImage(data: FormData): Observable<ProduitBase> {
    return this.apiService
      .post<ApiResponse<ProduitBase>>(this.endpoint, data)
      .pipe(map((r) => r.data));
  }

  /**
   * Met à jour un produit avec une nouvelle image (multipart/form-data).
   */
  updateWithImage(id: string, data: FormData): Observable<ProduitBase> {
    return this.apiService
      .put<ApiResponse<ProduitBase>>(`${this.endpoint}/${id}`, data)
      .pipe(map((r) => r.data));
  }
}
