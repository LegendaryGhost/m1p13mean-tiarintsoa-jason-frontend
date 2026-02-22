import { inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.interface';

/**
 * Generic CRUD service base class
 * @template TBase - The base entity type (unpopulated references)
 * @template TPopulated - The populated entity type (with nested objects)
 */
export abstract class CrudService<TBase, TPopulated = TBase> {
  protected apiService = inject(ApiService);
  
  /**
   * The API endpoint for this resource (e.g., 'boutiques', 'categories')
   * Must be defined by the child class
   */
  protected abstract endpoint: string;

  /**
   * Get all entities (returns populated entities for list views)
   */
  getAll(): Observable<TPopulated[]> {
    return this.apiService.get<ApiResponse<TPopulated[]>>(this.endpoint).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get a single entity by ID (returns populated entity for detail views)
   */
  getById(id: string): Observable<TPopulated | undefined> {
    return this.apiService.get<ApiResponse<TPopulated>>(`${this.endpoint}/${id}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create a new entity (uses base entity for form data)
   */
  create(data: Omit<TBase, '_id' | 'createdAt' | 'updatedAt'>): Observable<TBase> {
    return this.apiService.post<ApiResponse<TBase>>(this.endpoint, data).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update an existing entity (uses base entity for form data)
   */
  update(id: string, data: Partial<Omit<TBase, '_id' | 'createdAt' | 'updatedAt'>>): Observable<TBase> {
    return this.apiService.put<ApiResponse<TBase>>(`${this.endpoint}/${id}`, data).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete an entity by ID
   */
  delete(id: string): Observable<void> {
    return this.apiService.delete<ApiResponse<void>>(`${this.endpoint}/${id}`).pipe(
      map(() => undefined)
    );
  }
}
