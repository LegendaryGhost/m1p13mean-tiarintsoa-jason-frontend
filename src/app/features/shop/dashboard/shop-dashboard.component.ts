import { ChangeDetectionStrategy, Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ChartData, ChartOptions } from 'chart.js';
import { DashboardService, DashboardShopStats } from '../../../core/services/dashboard.service';

interface VisitorDataPoint {
  label: string;
  value: number;
}

interface PromotedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  boutiqueName: string;
}

interface DashboardChartColors {
  primary: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
}

@Component({
  selector: 'app-shop-dashboard',
  imports: [CardModule, ChartModule, CurrencyPipe],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div class="dashboard-title">
          <i class="pi pi-chart-line" aria-hidden="true"></i>
          <div>
            <h1>Dashboard boutique</h1>
            <p>Suivi des visites et de vos produits</p>
          </div>
        </div>
      </div>

      <section class="content-grid">
        <p-card>
          <div class="section-header">
            <div class="section-title-row">
              <div>
                <h2>Visites de la boutique</h2>
                <p>{{ visitorsPeriodLabel() }}</p>
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
            <span>Dernier jour: <strong>{{ visitorLatest() }} visites</strong></span>
            <span>Pic: <strong>{{ visitorPeak() }} visites</strong></span>
          </div>
        </p-card>

        <div class="right-column">
          <p-card>
            <div class="metric-card">
              <p class="metric-label">Nombre total de produits</p>
              <p class="metric-value">{{ totalProducts() }}</p>
            </div>
          </p-card>

          <p-card>
            <div class="section-header">
              <h2>Produits en promotions</h2>
              <p>Produits mis en avant</p>
            </div>

            @if (promotedProducts().length === 0) {
              <p class="empty-text">Aucun produit en promotion actuellement.</p>
            } @else {
              <ul class="promoted-list">
                @for (product of promotedProducts(); track product.id) {
                  <li>
                    <div class="product-main">
                      @if (product.image) {
                        <img [src]="product.image" [alt]="product.name" />
                      } @else {
                        <div class="image-placeholder" aria-hidden="true">
                          <i class="pi pi-image"></i>
                        </div>
                      }

                      <div class="product-info">
                        <p class="product-name">{{ product.name }}</p>
                        <p class="product-shop">{{ product.boutiqueName }}</p>
                      </div>
                    </div>

                    <span class="product-price">{{ product.price | currency:'MGA':'symbol':'1.0-0':'fr-FR' }}</span>
                  </li>
                }
              </ul>
            }
          </p-card>
        </div>
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
          color: var(--color-accent);
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

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
      align-items: start;
    }

    .right-column {
      display: grid;
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
        background: color-mix(in srgb, var(--color-accent) 12%, var(--color-background-primary));
        color: var(--color-accent);
      }
    }

    .line-chart {
      margin-top: 1rem;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background: color-mix(in srgb, var(--color-accent) 4%, var(--color-background-primary));
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

    .metric-card {
      display: grid;
      gap: 0.25rem;

      .metric-label {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: 0.875rem;
      }

      .metric-value {
        margin: 0;
        color: var(--color-text-primary);
        font-size: 2rem;
        font-weight: 700;
        line-height: 1;
      }
    }

    .empty-text {
      margin: 1rem 0 0;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

    .promoted-list {
      margin: 1rem 0 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: 0.75rem;

      li {
        border: 1px solid var(--color-border);
        border-radius: 8px;
        padding: 0.625rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }
    }

    .product-main {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      min-width: 0;
    }

    img,
    .image-placeholder {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      object-fit: cover;
      flex-shrink: 0;
      border: 1px solid var(--color-border);
    }

    .image-placeholder {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-secondary);
      background: var(--color-background-primary);
    }

    .product-info {
      min-width: 0;
    }

    .product-name {
      margin: 0;
      color: var(--color-text-primary);
      font-size: 0.9375rem;
      font-weight: 600;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 220px;
    }

    .product-shop {
      margin: 0.2rem 0 0;
      color: var(--color-text-secondary);
      font-size: 0.8125rem;
    }

    .product-price {
      color: var(--color-text-primary);
      font-size: 0.875rem;
      font-weight: 700;
      white-space: nowrap;
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

      .product-name {
        max-width: 100%;
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .promoted-list li {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  readonly chartColors = signal<DashboardChartColors>({
    primary: '#3F51B5',
    textPrimary: '#212121',
    textSecondary: '#616161',
    border: '#E0E0E0',
  });

  readonly periodDays = signal(7);
  readonly visitorSeries = signal<VisitorDataPoint[]>([]);
  readonly totalProducts = signal(0);
  readonly promotedProducts = signal<PromotedProduct[]>([]);

  readonly visitorChartData = computed<ChartData<'line'>>(() => {
    const colors = this.chartColors();
    return {
      labels: this.visitorSeries().map((point) => point.label),
      datasets: [
        {
          label: 'Visites',
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

  readonly visitorChartOptions = signal<ChartOptions<'line'>>({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
  });

  ngOnInit(): void {
    this.initializeChartOptionsFromTheme();
    this.loadShopDashboardStats();
  }

  private initializeChartOptionsFromTheme(): void {
    if (!this.isBrowser) {
      return;
    }

    const rootStyles = getComputedStyle(document.documentElement);
    const colors: DashboardChartColors = {
      primary: rootStyles.getPropertyValue('--color-accent').trim() || '#3F51B5',
      textPrimary: rootStyles.getPropertyValue('--color-text-primary').trim() || '#212121',
      textSecondary: rootStyles.getPropertyValue('--color-text-secondary').trim() || '#616161',
      border: rootStyles.getPropertyValue('--color-border').trim() || '#E0E0E0',
    };

    this.chartColors.set(colors);

    this.visitorChartOptions.set({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
          labels: { color: colors.textSecondary },
        },
        tooltip: { enabled: true },
      },
      scales: {
        x: {
          grid: { color: colors.border },
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
          grid: { color: colors.border },
        },
      },
    });
  }

  private loadShopDashboardStats(): void {
    this.dashboardService.getShopStats(this.periodDays()).subscribe({
      next: (stats: DashboardShopStats) => {
        this.periodDays.set(stats.visitors.periodDays);
        this.totalProducts.set(stats.totalProducts);
        this.promotedProducts.set(stats.promotedProducts ?? []);

        this.visitorSeries.set(
          stats.visitors.series.map((item) => ({
            label: this.formatDay(item.date, stats.visitors.periodDays),
            value: item.count,
          }))
        );
      },
      error: () => {
        this.visitorSeries.set([]);
        this.totalProducts.set(0);
        this.promotedProducts.set([]);
      },
    });
  }

  setPeriodDays(days: number): void {
    if (days === this.periodDays()) {
      return;
    }

    this.periodDays.set(days);
    this.loadShopDashboardStats();
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

  readonly visitorLatest = computed(() => {
    const series = this.visitorSeries();
    return series.length ? series[series.length - 1].value : 0;
  });

  readonly visitorPeak = computed(() => {
    const series = this.visitorSeries();
    return series.length ? Math.max(...series.map((point) => point.value)) : 0;
  });

  readonly visitorsPeriodLabel = computed(() => {
    if (this.periodDays() === 7) {
      return '7 derniers jours';
    }

    if (this.periodDays() === 30) {
      return '30 derniers jours';
    }

    return `Évolution sur ${this.periodDays()} jours`;
  });
}
