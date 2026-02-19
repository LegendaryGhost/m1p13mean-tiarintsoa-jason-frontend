import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Emplacement } from '../models';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class EmplacementService {
  private apiService = inject(ApiService);

  getEmplacementsByEtage(etageId: string): Observable<Emplacement[]> {
    return this.apiService.get<ApiResponse<Emplacement[]>>(`emplacements/etage/${etageId}`).pipe(
      map(response => response.data)
    );
  }

  getAllEmplacements(): Observable<Emplacement[]> {
    return this.apiService.get<ApiResponse<Emplacement[]>>('emplacements').pipe(
      map(response => response.data)
    );
  }
}
