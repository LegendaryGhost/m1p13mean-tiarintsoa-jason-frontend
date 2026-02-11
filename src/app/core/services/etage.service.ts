import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Etage } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class EtageService {
  private mockDataService = inject(MockDataService);

  getEtages(): Observable<Etage[]> {
    return of(this.mockDataService.etages());
  }

  getEtageById(id: string): Observable<Etage | undefined> {
    const etage = this.mockDataService.etages().find(e => e._id === id);
    return of(etage);
  }
}
