import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Categorie } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  private mockDataService = inject(MockDataService);

  getCategories(): Observable<Categorie[]> {
    return of(this.mockDataService.categories());
  }

  getCategorieById(id: string): Observable<Categorie | undefined> {
    const categorie = this.mockDataService.categories().find(c => c._id === id);
    return of(categorie);
  }
}
