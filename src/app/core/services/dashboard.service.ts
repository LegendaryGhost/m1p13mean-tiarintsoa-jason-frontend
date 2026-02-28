import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/api-response.interface';
import { ApiService } from './api.service';

interface DashboardVisitorPoint {
  date: string;
  count: number;
}

interface DashboardVisitorsStats {
  total: number;
  today: number;
  periodDays: number;
  series: DashboardVisitorPoint[];
}

interface DashboardSlotsStats {
  total: number;
  occupied: number;
  free: number;
  occupancyRate: number;
}

export interface DashboardAdminStats {
  visitors: DashboardVisitorsStats;
  slots: DashboardSlotsStats;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiService = inject(ApiService);

  getAdminStats(days = 7): Observable<DashboardAdminStats> {
    return this.apiService
      .get<ApiResponse<DashboardAdminStats>>(`dashboard/admin?days=${days}`)
      .pipe(map((response) => response.data));
  }
}
