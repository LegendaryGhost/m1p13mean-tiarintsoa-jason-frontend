import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { EmplacementBase, EmplacementPopulated } from '../models';
import { CrudService } from './crud.service';
import { ApiResponse } from '../models/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class EmplacementService extends CrudService<EmplacementBase, EmplacementPopulated> {
  protected override endpoint = 'emplacements';

  // Custom method for getting emplacements by floor (returns populated data)
  getEmplacementsByEtage(etageId: string): Observable<EmplacementPopulated[]> {
    return this.apiService.get<ApiResponse<EmplacementPopulated[]>>(`emplacements/etage/${etageId}`).pipe(
      map(response => response.data)
    );
  }

  // Returns only libre emplacements (for slot selection dropdowns)
  getDisponibles(): Observable<EmplacementPopulated[]> {
    return this.apiService
      .get<ApiResponse<EmplacementPopulated[]>>('emplacements/disponibles')
      .pipe(map((response) => response.data));
  }

  // Alias method for backward compatibility
  getAllEmplacements() {
    return this.getAll();
  }
}
