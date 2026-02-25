import { Injectable } from '@angular/core';
import { CategorieBase } from '../models';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root'
})
export class CategorieService extends CrudService<CategorieBase, CategorieBase> {
  protected override endpoint = 'categories';

  // Alias methods for backward compatibility
  getAllCategories() {
    return this.getAll();
  }

  getCategorieById(id: string) {
    return this.getById(id);
  }
}
