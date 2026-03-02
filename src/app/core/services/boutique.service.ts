import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BoutiqueBase, BoutiquePopulated } from '../models';
import { ApiResponse } from '../models/api-response.interface';
import { CrudService } from './crud.service';

export interface CreateBoutiquePayload {
  nom: string;
  description?: string;
  categorieId: string;
  heureOuverture: string;
  heureFermeture: string;
  joursOuverture: string[];
  logo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BoutiqueService extends CrudService<BoutiqueBase, BoutiquePopulated> {
  protected override endpoint = 'boutiques';

  /**
   * Returns only the shops owned by the authenticated boutique account.
   * Calls GET /boutiques/mes-boutiques (auth-guarded, boutique role).
   */
  getMesBoutiques(): Observable<BoutiquePopulated[]> {
    return this.apiService
      .get<ApiResponse<BoutiquePopulated[]>>(`${this.endpoint}/mes-boutiques`)
      .pipe(map((r) => r.data));
  }

  /**
   * Creates a new shop for the authenticated boutique user.
   * The userId is automatically set server-side from the JWT token.
   * Calls POST /boutiques/mes-boutiques (auth-guarded, boutique role).
   */
  createMaBoutique(payload: CreateBoutiquePayload): Observable<BoutiquePopulated> {
    return this.apiService
      .post<ApiResponse<BoutiquePopulated>>(`${this.endpoint}/mes-boutiques`, payload)
      .pipe(map((r) => r.data));
  }

  /**
   * Updates an existing shop owned by the authenticated boutique user.
   * Calls PUT /boutiques/mes-boutiques/:id (auth-guarded, boutique role).
   */
  updateMaBoutique(id: string, payload: Partial<CreateBoutiquePayload>): Observable<BoutiquePopulated> {
    return this.apiService
      .put<ApiResponse<BoutiquePopulated>>(`${this.endpoint}/mes-boutiques/${id}`, payload)
      .pipe(map((r) => r.data));
  }


  // Alias methods for backward compatibility
  getAllBoutiques() {
    return this.getAll();
  }

  getBoutiqueById(id: string) {
    return this.getById(id);
  }
}
