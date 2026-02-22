import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.interface';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiService = inject(ApiService);
  private endpoint = 'users';

  /**
   * Get all pending boutique registrations (not approved yet)
   */
  getPendingBoutiques(): Observable<User[]> {
    return this.apiService.get<ApiResponse<User[]>>(`${this.endpoint}/pending-boutiques`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get all boutique users
   */
  getAllBoutiques(): Observable<User[]> {
    return this.apiService.get<ApiResponse<User[]>>(`${this.endpoint}/boutiques`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Approve a boutique registration
   */
  approveBoutique(id: string): Observable<User> {
    return this.apiService.patch<ApiResponse<User>>(`${this.endpoint}/${id}/approve`, {}).pipe(
      map(response => response.data)
    );
  }

  /**
   * Reject/Delete a pending boutique registration
   */
  rejectBoutique(id: string): Observable<void> {
    return this.apiService.delete<ApiResponse<void>>(`${this.endpoint}/${id}/reject`).pipe(
      map(() => undefined)
    );
  }
}
