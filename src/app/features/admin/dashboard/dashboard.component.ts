import { ChangeDetectionStrategy, Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ChartData, ChartOptions } from 'chart.js';
import { DashboardService } from '../../../core/services/dashboard.service';

interface VisitorDataPoint {
  label: string;
  value: number;
}

interface ShopVisitStat {
  name: string;
  visits: number;
}

interface DashboardChartColors {
  primary: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  warning: string;
  success: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CardModule, ChartModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div class="dashboard-title">
          <i class="pi pi-chart-line" aria-hidden="true"></i>
          <div>
            <h1>Tableau de bord administrateur</h1>
            <p>Vue d’ensemble des emplacements et de la fréquentation</p>
          </div>
        </div>
      </div>

      <section class="stats-grid" aria-label="Statistiques des emplacements">
        <p-card>
          <div class="slot-distribution-card">
            <div class="section-header">
              <h2>Répartition des emplacements</h2>
              <p>Camembert des emplacements occupés vs libres</p>
            </div>

            <div class="slot-distribution-content">
              <div class="doughnut-chart-container">
                <p-chart type="doughnut" [data]="slotChartData()" [options]="slotChartOptions()" />
                <p class="doughnut-center-label"><strong>{{ occupancyRate() }}%</strong> occupés</p>
              </div>

              <div class="slot-legend">
                <div class="slot-item occupied">
                  <span class="dot" aria-hidden="true"></span>
                  <div>
                    <p class="item-label">Occupés</p>
                    <p class="item-value">{{ occupiedSlots() }} emplacements</p>
                  </div>
                </div>

                <div class="slot-item free">
                  <span class="dot" aria-hidden="true"></span>
                  <div>
                    <p class="item-label">Libres</p>
                    <p class="item-value">{{ freeSlots() }} emplacements</p>
                  </div>
                </div>

                <p class="slot-total">Total: {{ totalSlots() }} emplacements</p>
              </div>
            </div>
          </div>
        </p-card>
      </section>

      <section class="content-grid">
        <p-card>
          <div class="section-header">
            <div class="section-title-row">
              <div>
                <h2>Nombre de visiteurs</h2>
                <p>Évolution sur {{ periodDays() }} jours</p>
              </div>

              <div class="period-selector" role="group" aria-label="Sélection de la période">
                <button
                  type="button"
                  class="period-button"
                  [class.active]="periodDays() === 7"
                  (click)="setPeriodDays(7)">
                  7 jours
                </button>
                <button
                  type="button"
                  class="period-button"
                  [class.active]="periodDays() === 30"
                  (click)="setPeriodDays(30)">
                  30 jours
                </button>
              </div>
            </div>
          </div>

          <div class="line-chart">
            <p-chart type="line" [data]="visitorChartData()" [options]="visitorChartOptions()" />
          </div>

          <div class="chart-summary">
            <span>Dernier jour: <strong>{{ visitorLatest() }} visiteurs</strong></span>
            <span>Pic: <strong>{{ visitorPeak() }} visiteurs</strong></span>
          </div>
        </p-card>

        <p-card>
          <div class="section-header">
            <h2>Boutiques les plus visitées</h2>
            <p>Top fréquentation</p>
          </div>

          <ol class="shop-ranking">
            @for (shop of topShops(); track shop.name; let i = $index) {
              <li>
                <div class="rank-left">
                  <span class="rank">#{{ i + 1 }}</span>
                  <span class="shop-name">{{ shop.name }}</span>
                </div>
                <span class="visits">{{ shop.visits }} visites</span>
              </li>
            }
          </ol>
        </p-card>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      gap: 1rem;
    }

    .dashboard-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;

      .dashboard-title {
        display: flex;
        align-items: center;
        gap: 0.875rem;

        i {
          font-size: 1.75rem;
          color: var(--color-info);
        }

        h1 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--color-text-primary);
        }

        p {
          margin: 0.25rem 0 0;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .slot-distribution-card {
      display: grid;
      gap: 1rem;
    }

    .slot-distribution-content {
      display: grid;
      justify-items: center;
      gap: 1rem;
    }

    .doughnut-chart-container {
      width: min(100%, 280px);
      margin: 0 auto;

      .doughnut-center-label {
        margin: 0.5rem 0 0;
        text-align: center;
        color: var(--color-text-secondary);
        font-size: 0.875rem;

        strong {
          color: var(--color-text-primary);
        }
      }
    }

    .slot-legend {
      display: grid;
      gap: 0.75rem;
      width: min(100%, 360px);
    }

    .slot-item {
      display: flex;
      align-items: center;
      gap: 0.625rem;

      .dot {
        width: 0.875rem;
        height: 0.875rem;
        border-radius: 999px;
      }

      .item-label {
        margin: 0;
        font-size: 0.875rem;
        color: var(--color-text-secondary);
      }

      .item-value {
        margin: 0.125rem 0 0;
        font-size: 0.9375rem;
        color: var(--color-text-primary);
        font-weight: 600;
      }

      &.occupied .dot {
        background: var(--color-warning);
      }

      &.free .dot {
        background: var(--color-success);
      }
    }

    .slot-total {
      margin: 0.25rem 0 0;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
      text-align: center;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
    }

    .section-header {
      .section-title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      h2 {
        margin: 0;
        color: var(--color-text-primary);
        font-size: 1.125rem;
      }

      p {
        margin: 0.25rem 0 0;
        color: var(--color-text-secondary);
        font-size: 0.875rem;
      }
    }

    .period-selector {
      display: inline-flex;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      overflow: hidden;
    }

    .period-button {
      border: none;
      background: var(--color-background-primary);
      color: var(--color-text-secondary);
      padding: 0.4rem 0.75rem;
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;

      &:not(:last-child) {
        border-right: 1px solid var(--color-border);
      }

      &.active {
        background: color-mix(in srgb, var(--color-primary) 12%, var(--color-background-primary));
        color: var(--color-primary);
      }
    }

    .line-chart {
      margin-top: 1rem;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background: color-mix(in srgb, var(--color-primary) 4%, var(--color-background-primary));
      padding: 0.75rem;
      min-height: 280px;
    }

    .chart-summary {
      margin-top: 0.75rem;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

    .shop-ranking {
      margin: 1rem 0 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: 0.75rem;

      li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        padding: 0.75rem;
        background: var(--color-background-primary);
      }

      .rank-left {
        display: flex;
        align-items: center;
        gap: 0.625rem;
      }

      .rank {
        min-width: 2rem;
        height: 2rem;
        border-radius: 999px;
        background: color-mix(in srgb, var(--color-primary) 15%, var(--color-background-primary));
        color: var(--color-primary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
      }

      .shop-name {
        color: var(--color-text-primary);
        font-weight: 500;
      }

      .visits {
        color: var(--color-text-secondary);
        font-size: 0.875rem;
        white-space: nowrap;
      }
    }

    ::ng-deep {
      .p-card {
        background: var(--color-background-primary);
        border: 1px solid var(--color-border);
        border-radius: 12px;
        box-shadow: 0 2px 8px color-mix(in srgb, var(--color-text-primary) 8%, transparent);
      }

      .p-card-body {
        padding: 1rem;
      }
    }

    @media (max-width: 1100px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  readonly chartColors = signal<DashboardChartColors>({
    primary: '#1976D2',
    textPrimary: '#212121',
    textSecondary: '#616161',
    border: '#E0E0E0',
    warning: '#FF9800',
    success: '#4CAF50',
  });

  readonly freeSlots = signal(0);
  readonly occupiedSlots = signal(0);
  readonly periodDays = signal(7);

  readonly visitorSeries = signal<VisitorDataPoint[]>([]);

  readonly topShops = signal<ShopVisitStat[]>([
    { name: 'Boutique Élégance', visits: 1840 },
    { name: 'Tech Horizon', visits: 1625 },
    { name: 'Maison Gourmande', visits: 1498 },
  ]);

  readonly slotChartData = computed<ChartData<'doughnut'>>(() => {
    const colors = this.chartColors();
    return {
      labels: ['Occupés', 'Libres'],
      datasets: [
        {
          data: [this.occupiedSlots(), this.freeSlots()],
          backgroundColor: [colors.warning, colors.success],
          borderColor: colors.border,
          borderWidth: 1,
        },
      ],
    };
  });

  readonly visitorChartData = computed<ChartData<'line'>>(() => {
    const colors = this.chartColors();
    return {
      labels: this.visitorSeries().map((point) => point.label),
      datasets: [
        {
          label: 'Visiteurs',
          data: this.visitorSeries().map((point) => point.value),
          borderColor: colors.primary,
          backgroundColor: colors.primary,
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 4,
          fill: false,
        },
      ],
    };
  });

  readonly slotChartOptions = signal<ChartOptions<'doughnut'>>({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    cutout: '62%',
  });

  readonly visitorChartOptions = signal<ChartOptions<'line'>>({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  });

  ngOnInit(): void {
    this.initializeChartOptionsFromTheme();
    this.loadDashboardStats();
  }

  private initializeChartOptionsFromTheme(): void {
    if (!this.isBrowser) {
      return;
    }

    const rootStyles = getComputedStyle(document.documentElement);
    const colors: DashboardChartColors = {
      primary: rootStyles.getPropertyValue('--color-primary').trim() || '#1976D2',
      textPrimary: rootStyles.getPropertyValue('--color-text-primary').trim() || '#212121',
      textSecondary: rootStyles.getPropertyValue('--color-text-secondary').trim() || '#616161',
      border: rootStyles.getPropertyValue('--color-border').trim() || '#E0E0E0',
      warning: rootStyles.getPropertyValue('--color-warning').trim() || '#FF9800',
      success: rootStyles.getPropertyValue('--color-success').trim() || '#4CAF50',
    };

    this.chartColors.set(colors);

    this.slotChartOptions.set({
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
          labels: {
            color: colors.textSecondary,
          },
        },
        tooltip: {
          enabled: true,
        },
      },
      cutout: '62%',
    });

    this.visitorChartOptions.set({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
          labels: {
            color: colors.textSecondary,
          },
        },
        tooltip: {
          enabled: true,
        },
      },
      scales: {
        x: {
          grid: {
            color: colors.border,
          },
          ticks: {
            color: colors.textSecondary,
            autoSkip: true,
            maxRotation: 0,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: colors.textSecondary,
            precision: 0,
          },
          grid: {
            color: colors.border,
          },
        },
      },
    });
  }

  private loadDashboardStats(): void {
    this.dashboardService.getAdminStats(this.periodDays()).subscribe({
      next: (stats) => {
        this.periodDays.set(stats.visitors.periodDays);
        this.freeSlots.set(stats.slots.free);
        this.occupiedSlots.set(stats.slots.occupied);

        this.visitorSeries.set(
          stats.visitors.series.map((item) => ({
            label: this.formatDay(item.date, stats.visitors.periodDays),
            value: item.count,
          }))
        );
      },
      error: () => {
        this.visitorSeries.set([]);
        this.freeSlots.set(0);
        this.occupiedSlots.set(0);
      },
    });
  }

  setPeriodDays(days: number): void {
    if (days === this.periodDays()) {
      return;
    }

    this.periodDays.set(days);
    this.loadDashboardStats();
  }

  private formatDay(dateIso: string, periodDays: number): string {
    const date = new Date(dateIso);
    if (Number.isNaN(date.getTime())) {
      return dateIso;
    }

    if (periodDays <= 7) {
      const dayLabel = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(date);
      return dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1, 3);
    }

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    }).format(date);
  }

  readonly totalSlots = computed(() => this.freeSlots() + this.occupiedSlots());

  readonly occupancyRate = computed(() => {
    const total = this.totalSlots();
    if (total === 0) return 0;
    return Math.round((this.occupiedSlots() / total) * 100);
  });

  readonly visitorLatest = computed(() => {
    const series = this.visitorSeries();
    return series.length ? series[series.length - 1].value : 0;
  });

  readonly visitorPeak = computed(() => {
    const series = this.visitorSeries();
    return series.length ? Math.max(...series.map((point) => point.value)) : 0;
  });
}
