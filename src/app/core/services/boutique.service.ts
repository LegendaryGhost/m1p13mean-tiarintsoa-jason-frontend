import { Injectable } from '@angular/core';
import { BoutiqueBase, BoutiquePopulated } from '../models';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root'
})
export class BoutiqueService extends CrudService<BoutiqueBase, BoutiquePopulated> {
  protected override endpoint = 'boutiques';

  // Alias methods for backward compatibility
  getAllBoutiques() {
    return this.getAll();
  }

  getBoutiqueById(id: string) {
    return this.getById(id);
  }
}
