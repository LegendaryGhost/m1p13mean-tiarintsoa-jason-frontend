import { Component, ChangeDetectionStrategy, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { Boutique, BoutiquePopulated, Categorie } from '../../core/models';

@Component({
  selector: 'app-shop-detail-modal',
  imports: [CommonModule, DialogModule, ButtonModule, CardModule, TagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-dialog
      [visible]="visible()"
      [modal]="true"
      [closable]="true"
      [dismissableMask]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '90vw', maxWidth: '600px' }"
      (visibleChange)="onVisibleChange($event)"
      styleClass="shop-detail-dialog">

      @if (boutique(); as shop) {
        <ng-template #header>
          <div class="dialog-header">
            <img [src]="shop.logo" [alt]="shop.nom + ' logo'" class="shop-logo">
            <div class="shop-title">
              <h2>{{ shop.nom }}</h2>
              @if (boutique()?.categorieId; as cat) {
                <p-tag
                  [value]="cat.nom"
                  [icon]="getIconClass(cat.icon)"
                  [style]="{ 'background-color': cat.couleur, 'color': 'white' }"
                />
              }
            </div>
          </div>
        </ng-template>

        <div class="shop-content">
          <div class="shop-description">
            <h3>A propos</h3>
            <p>{{ shop.description }}</p>
          </div>

          <div class="shop-hours">
            <h3>Heures d'ouverture</h3>
            <div class="hours-info">
              <i class="pi pi-clock"></i>
              <span>{{ shop.heureOuverture }} - {{ shop.heureFermeture }}</span>
            </div>
            <div class="days-info">
              <i class="pi pi-calendar"></i>
              <span>{{ formatJours(shop.joursOuverture) }}</span>
            </div>
          </div>

          @if (shop.statut === 'validee') {
            <div class="shop-status">
              <i class="pi pi-check-circle" style="color: var(--color-success);"></i>
              <span>Boutique vérifiée</span>
            </div>
          }
        </div>

        <ng-template #footer>
          <p-button
            label="Fermer"
            icon="pi pi-times"
            (onClick)="onVisibleChange(false)"
            [text]="true"
            severity="secondary">
          </p-button>
        </ng-template>
      }
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep .shop-detail-dialog {
      .p-dialog-header {
        padding: 1.5rem;
        border-bottom: 1px solid var(--color-border);
      }

      .p-dialog-content {
        padding: 1.5rem;
      }

      .p-dialog-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--color-border);
      }
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 100%;
    }

    .shop-logo {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      object-fit: cover;
      border: 2px solid var(--color-border);
    }

    .shop-title {
      flex: 1;

      h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--color-text-primary);
      }
    }

    .shop-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--color-text-primary);
      }

      p {
        margin: 0;
        line-height: 1.5;
        color: var(--color-text-secondary);
      }
    }

    .shop-hours {
      .hours-info,
      .days-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        color: var(--color-text-secondary);

        i {
          color: var(--color-primary);
        }
      }
    }

    .shop-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background-color: var(--color-background-secondary);
      border-radius: 6px;
      font-weight: 500;
      color: var(--color-success);
    }
  `]
})
export class ShopDetailModalComponent {
  visible = input.required<boolean>();
  boutique = input.required<BoutiquePopulated | null>();
  visibleChange = output<boolean>();

  onVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
  }

  getIconClass(icon: string): string {
    return icon?.startsWith('pi ') ? icon : `pi ${icon}`;
  }

  formatJours(jours: string[]): string {
    if (jours.length === 7) return 'Tous les jours';
    if (jours.length === 0) return 'Fermé';

    const jourMap: Record<string, string> = {
      'lundi': 'Lun',
      'mardi': 'Mar',
      'mercredi': 'Mer',
      'jeudi': 'Jeu',
      'vendredi': 'Ven',
      'samedi': 'Sam',
      'dimanche': 'Dim'
    };

    return jours.map(j => jourMap[j] || j).join(', ');
  }
}
