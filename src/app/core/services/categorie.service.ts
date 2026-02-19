import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Categorie } from '../models';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  private apiService = inject(ApiService);

  getAllCategories(): Observable<Categorie[]> {
    return this.apiService.get<ApiResponse<Categorie[]>>('categories').pipe(
      map(response => response.data)
    );
  }

  getCategorieById(id: string): Observable<Categorie | undefined> {
    return this.apiService.get<ApiResponse<Categorie>>(`categories/${id}`).pipe(
      map(response => response.data)
    );
  }
}
