import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { ApiService } from './api.service';

interface PageViewPayload {
  type: 'site';
}

@Injectable({
  providedIn: 'root'
})
export class VisitTrackingService {
  private apiService = inject(ApiService);
  private readonly lastTrackedAtKey = 'analytics:lastTrackedAt:/';
  private readonly trackingCooldownMs = 30 * 60 * 1000;

  trackMapHomeVisit(): Observable<unknown> {
    if (!this.shouldTrackNow()) {
      return EMPTY;
    }

    this.setLastTrackedAt(Date.now());

    const payload: PageViewPayload = {
      type: 'site',
    };

    return this.apiService.post('visites', payload);
  }

  private shouldTrackNow(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const lastTrackedAtRaw = localStorage.getItem(this.lastTrackedAtKey);
    if (!lastTrackedAtRaw) {
      return true;
    }

    const lastTrackedAt = Number(lastTrackedAtRaw);
    if (Number.isNaN(lastTrackedAt)) {
      return true;
    }

    return Date.now() - lastTrackedAt >= this.trackingCooldownMs;
  }

  private setLastTrackedAt(timestamp: number): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(this.lastTrackedAtKey, String(timestamp));
  }
}
