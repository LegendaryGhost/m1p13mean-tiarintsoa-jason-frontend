import { Injectable } from '@angular/core';
import { EtageBase } from '../models';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root'
})
export class EtageService extends CrudService<EtageBase, EtageBase> {
  protected override endpoint = 'etages';

  // Alias methods for backward compatibility
  getEtages() {
    return this.getAll();
  }

  getEtageById(id: string) {
    return this.getById(id);
  }
}
