import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Boutique } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class BoutiqueService {
  private mockDataService = inject(MockDataService);

  getBoutiqueById(id: string): Observable<Boutique | undefined> {
    const boutique = this.mockDataService.boutiques().find(b => b._id === id);
    return of(boutique);
  }

  getAllBoutiques(): Observable<Boutique[]> {
    return of(this.mockDataService.boutiques());
  }

  getBoutiquesByCategorie(categorieId: string): Observable<Boutique[]> {
    const boutiques = this.mockDataService.boutiques().filter(b => b.categorieId === categorieId);
    return of(boutiques);
  }
}
