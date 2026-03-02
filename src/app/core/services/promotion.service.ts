import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PromotionBase, PromotionPopulated } from '../models';
import { ApiResponse } from '../models/api-response.interface';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root',
})
export class PromotionService extends CrudService<PromotionBase, PromotionPopulated> {
  protected override endpoint = 'promotions';

  /** Promotions des boutiques appartenant à l'utilisateur connecté. */
  getMesPromotions(): Observable<PromotionPopulated[]> {
    return this.apiService
      .get<ApiResponse<PromotionPopulated[]>>(`${this.endpoint}/mes-promotions`)
      .pipe(map((r) => r.data));
  }

  /** Promotions d'une boutique donnée (public). */
  getPromotionsByBoutique(boutiqueId: string): Observable<PromotionPopulated[]> {
    return this.apiService
      .get<ApiResponse<PromotionPopulated[]>>(`${this.endpoint}/boutique/${boutiqueId}`)
      .pipe(map((r) => r.data));
  }

  /**
   * Crée une promotion avec image (multipart/form-data).
   */
  createWithImage(data: FormData): Observable<PromotionBase> {
    return this.apiService
      .post<ApiResponse<PromotionBase>>(this.endpoint, data)
      .pipe(map((r) => r.data));
  }

  /**
   * Met à jour une promotion avec une nouvelle image (multipart/form-data).
   */
  updateWithImage(id: string, data: FormData): Observable<PromotionBase> {
    return this.apiService
      .put<ApiResponse<PromotionBase>>(`${this.endpoint}/${id}`, data)
      .pipe(map((r) => r.data));
  }
}
