import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Boutique } from '../models';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class BoutiqueService {
  private apiService = inject(ApiService);

  getBoutiqueById(id: string): Observable<Boutique | undefined> {
    return this.apiService.get<ApiResponse<Boutique>>(`boutiques/${id}`).pipe(
      map(response => response.data)
    );
  }

  getAllBoutiques(): Observable<Boutique[]> {
    return this.apiService.get<ApiResponse<Boutique[]>>('boutiques').pipe(
      map(response => response.data)
    );
  }
}
