import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CrudService } from './crud.service';
import { ApiResponse } from '../models/api-response.interface';
import {
  DemandeBoutiqueBase,
  DemandeBoutiquePopulated,
  CreateDemandePayload,
} from '../models/demande-boutique.model';

@Injectable({
  providedIn: 'root',
})
export class DemandeBoutiqueService extends CrudService<DemandeBoutiqueBase, DemandeBoutiquePopulated> {
  protected override endpoint = 'demandes-boutiques';

  /**
   * Boutique: list requests belonging to the authenticated shop account.
   */
  getMesDemandes(): Observable<DemandeBoutiquePopulated[]> {
    return this.apiService
      .get<ApiResponse<DemandeBoutiquePopulated[]>>(`${this.endpoint}/mes-demandes`)
      .pipe(map((r) => r.data));
  }

  /**
   * Boutique: submit a new slot location request.
   * boutiqueId must belong to the authenticated user (validated server-side).
   */
  createDemande(payload: CreateDemandePayload): Observable<DemandeBoutiquePopulated> {
    return this.apiService
      .post<ApiResponse<DemandeBoutiquePopulated>>(this.endpoint, payload)
      .pipe(map((r) => r.data));
  }

  /**
   * Admin: accept or reject a request.
   */
  updateStatut(
    id: string,
    statut: 'acceptee' | 'refusee',
    motifRefus?: string
  ): Observable<DemandeBoutiquePopulated> {
    return this.apiService
      .patch<ApiResponse<DemandeBoutiquePopulated>>(`${this.endpoint}/${id}/statut`, {
        statut,
        ...(motifRefus ? { motifRefus } : {}),
      })
      .pipe(map((r) => r.data));
  }
}
