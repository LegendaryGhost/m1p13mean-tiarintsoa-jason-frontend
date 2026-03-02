import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocationEmplacementBase, LocationEmplacementPopulated } from '../models/location-emplacement.model';
import { ApiResponse } from '../models/api-response.interface';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class LocationService extends CrudService<LocationEmplacementBase, LocationEmplacementPopulated> {
  protected override endpoint = 'locations';

  /**
   * Returns all active locations for a given floor.
   * Active = dateDebut <= now AND (dateFin is null OR dateFin >= now)
   */
  getActiveLocations(etageId: string): Observable<LocationEmplacementPopulated[]> {
    return this.apiService
      .get<ApiResponse<LocationEmplacementPopulated[]>>(`${this.endpoint}/actives?etageId=${etageId}`)
      .pipe(map((res) => res.data));
  }
}
