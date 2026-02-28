import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BoutiqueBase, BoutiquePopulated } from '../models';
import { ApiResponse } from '../models/api-response.interface';
import { CrudService } from './crud.service';

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

  // Alias methods for backward compatibility
  getAllBoutiques() {
    return this.getAll();
  }

  getBoutiqueById(id: string) {
    return this.getById(id);
  }
}
