import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Etage } from '../models';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class EtageService {
  private apiService = inject(ApiService);

  getEtages(): Observable<Etage[]> {
    return this.apiService.get<ApiResponse<Etage[]>>('etages').pipe(
      map(response => response.data)
    );
  }

  getEtageById(id: string): Observable<Etage | undefined> {
    return this.apiService.get<ApiResponse<Etage>>(`etages/${id}`).pipe(
      map(response => response.data)
    );
  }
}
