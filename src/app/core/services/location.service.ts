import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LocationEmplacementPopulated } from '../models/location-emplacement.model';
import { ApiResponse } from '../models/api-response.interface';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private apiService = inject(ApiService);

  /**
   * Returns all active locations for a given floor.
   * Active = dateDebut <= now AND (dateFin is null OR dateFin >= now)
   */
  getActiveLocations(etageId: string): Observable<LocationEmplacementPopulated[]> {
    return this.apiService
      .get<ApiResponse<LocationEmplacementPopulated[]>>(`locations/actives?etageId=${etageId}`)
      .pipe(map((res) => res.data));
  }
}
