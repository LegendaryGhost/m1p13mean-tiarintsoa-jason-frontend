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

interface ShopPromotedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  boutiqueName: string;
}

interface ShopVisitorsStats {
  periodDays: number;
  series: DashboardVisitorPoint[];
}

interface DashboardTopBoutique {
  name: string;
  visits: number;
}

export interface DashboardAdminStats {
  visitors: DashboardVisitorsStats;
  slots: DashboardSlotsStats;
  topBoutiques: DashboardTopBoutique[];
}

export interface DashboardShopStats {
  visitors: ShopVisitorsStats;
  totalProducts: number;
  promotedProducts: ShopPromotedProduct[];
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

  getShopStats(days = 7): Observable<DashboardShopStats> {
    return this.apiService
      .get<ApiResponse<DashboardShopStats>>(`dashboard/boutique?days=${days}`)
      .pipe(map((response) => response.data));
  }
}
