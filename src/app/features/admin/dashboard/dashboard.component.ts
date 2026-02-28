import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

interface VisitorDataPoint {
  day: string;
  value: number;
}

interface ShopVisitStat {
  name: string;
  visits: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [CardModule, TagModule],
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
        <p-tag value="Données mockées" severity="warn" />
      </div>

      <section class="stats-grid" aria-label="Statistiques des emplacements">
        <p-card>
          <div class="slot-distribution-card">
            <div class="section-header">
              <h2>Répartition des emplacements</h2>
              <p>Camembert des emplacements occupés vs libres</p>
            </div>

            <div class="slot-distribution-content">
              <div class="pie-chart-wrapper">
                <div
                  class="pie-chart"
                  role="img"
                  [style.--occupied-percent]="occupancyRate() + '%'"
                  [attr.aria-label]="'Camembert: ' + occupancyRate() + '% occupés et ' + freeRate() + '% libres'"
                >
                  <div class="pie-center">
                    <strong>{{ occupancyRate() }}%</strong>
                    <span>occupés</span>
                  </div>
                </div>
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
            <h2>Nombre de visiteurs</h2>
            <p>Évolution sur 7 jours</p>
          </div>

          <div class="line-chart" role="img" aria-label="Courbe de fréquentation des visiteurs sur 7 jours">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                [attr.points]="visitorChartPoints()"
                class="line"
              />
            </svg>
          </div>

          <div class="chart-legend">
            @for (point of visitorSeries(); track point.day) {
              <div class="legend-item">
                <span class="day">{{ point.day }}</span>
                <span class="count">{{ point.value }}</span>
              </div>
            }
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

    .pie-chart-wrapper {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .pie-chart {
      --occupied-percent: 50%;
      width: 170px;
      height: 170px;
      border-radius: 999px;
      background: conic-gradient(
        var(--color-warning) 0% var(--occupied-percent),
        var(--color-success) var(--occupied-percent) 100%
      );
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }

    .pie-center {
      width: 110px;
      height: 110px;
      border-radius: 999px;
      background: var(--color-background-primary);
      border: 1px solid var(--color-border);
      display: grid;
      place-items: center;
      text-align: center;
      gap: 0.125rem;

      strong {
        color: var(--color-text-primary);
        font-size: 1.375rem;
      }

      span {
        color: var(--color-text-secondary);
        font-size: 0.8125rem;
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

    .line-chart {
      margin-top: 1rem;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background: color-mix(in srgb, var(--color-primary) 4%, var(--color-background-primary));
      padding: 0.75rem;

      svg {
        width: 100%;
        height: 220px;
        display: block;
      }

      .line {
        fill: none;
        stroke: var(--color-primary);
        stroke-width: 2.5;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    }

    .chart-legend {
      margin-top: 0.75rem;
      display: grid;
      grid-template-columns: repeat(7, minmax(60px, 1fr));
      gap: 0.5rem;

      .legend-item {
        display: grid;
        justify-items: center;
        gap: 0.125rem;

        .day {
          color: var(--color-text-secondary);
          font-size: 0.8125rem;
        }

        .count {
          color: var(--color-text-primary);
          font-size: 0.875rem;
          font-weight: 600;
        }
      }
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

      .chart-legend {
        grid-template-columns: repeat(4, minmax(60px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .chart-legend {
        grid-template-columns: repeat(2, minmax(60px, 1fr));
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly freeSlots = signal(42);
  readonly occupiedSlots = signal(118);

  readonly visitorSeries = signal<VisitorDataPoint[]>([
    { day: 'Lun', value: 1120 },
    { day: 'Mar', value: 1280 },
    { day: 'Mer', value: 1210 },
    { day: 'Jeu', value: 1490 },
    { day: 'Ven', value: 1730 },
    { day: 'Sam', value: 2310 },
    { day: 'Dim', value: 1980 },
  ]);

  readonly topShops = signal<ShopVisitStat[]>([
    { name: 'Boutique Élégance', visits: 1840 },
    { name: 'Tech Horizon', visits: 1625 },
    { name: 'Maison Gourmande', visits: 1498 },
  ]);

  readonly totalSlots = computed(() => this.freeSlots() + this.occupiedSlots());

  readonly occupancyRate = computed(() => {
    const total = this.totalSlots();
    if (total === 0) return 0;
    return Math.round((this.occupiedSlots() / total) * 100);
  });

  readonly freeRate = computed(() => 100 - this.occupancyRate());

  readonly visitorChartPoints = computed(() => {
    const series = this.visitorSeries();
    if (series.length <= 1) return '';

    const width = 100;
    const height = 100;
    const maxValue = Math.max(...series.map((point) => point.value));
    const minValue = Math.min(...series.map((point) => point.value));
    const range = Math.max(1, maxValue - minValue);

    return series
      .map((point, index) => {
        const x = (index / (series.length - 1)) * width;
        const normalizedY = (point.value - minValue) / range;
        const y = height - normalizedY * height;
        return `${x},${y}`;
      })
      .join(' ');
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
