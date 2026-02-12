import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Emplacement } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class EmplacementService {
  private mockDataService = inject(MockDataService);

  getEmplacementsByEtage(etageId: string): Observable<Emplacement[]> {
    const emplacements = this.mockDataService.emplacements().filter(e => e.etageId === etageId);
    return of(emplacements);
  }

  getEmplacementById(id: string): Observable<Emplacement | undefined> {
    const emplacement = this.mockDataService.emplacements().find(e => e._id === id);
    return of(emplacement);
  }

  getAllEmplacements(): Observable<Emplacement[]> {
    return of(this.mockDataService.emplacements());
  }
}
