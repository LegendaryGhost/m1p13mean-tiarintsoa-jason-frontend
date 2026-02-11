import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Etage } from '../../core/models';

@Component({
  selector: 'app-floor-selector',
  imports: [CommonModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="floor-selector" role="navigation" aria-label="Floor selector">
      <div class="floor-selector-title">
        <i class="pi pi-building"></i>
        <span>Floors</span>
      </div>

      @for (etage of etages(); track etage._id) {
        <button
          class="floor-button"
          [class.active]="etage._id === selectedEtageId()"
          (click)="selectEtage(etage._id)"
          [attr.aria-label]="'Go to ' + etage.nom"
          [attr.aria-pressed]="etage._id === selectedEtageId()">
          <span class="floor-level">{{ etage.niveau }}</span>
          <span class="floor-name">{{ etage.nom }}</span>
        </button>
      }
    </div>
  `,
  styles: [`
    .floor-selector {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      background: var(--color-background-primary);
      padding: 1rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 140px;
    }

    .floor-selector-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--color-border);
      margin-bottom: 0.5rem;

      i {
        color: var(--color-primary);
      }
    }

    .floor-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      padding: 0.75rem;
      border: 2px solid var(--color-border);
      background: var(--color-background-primary);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      min-height: 60px;

      &:hover {
        border-color: var(--color-primary);
        background: var(--color-primary-light);
      }

      &:focus {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
      }

      &.active {
        border-color: var(--color-primary);
        background: var(--color-primary);
        color: white;
        box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);

        .floor-level,
        .floor-name {
          color: white;
        }
      }
    }

    .floor-level {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text-primary);
      line-height: 1;
    }

    .floor-name {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--color-text-secondary);
      text-align: center;
      line-height: 1.2;
    }

    @media (max-width: 768px) {
      .floor-selector {
        padding: 0.75rem;
        min-width: 100px;
      }

      .floor-button {
        min-height: 50px;
        padding: 0.5rem;
      }

      .floor-level {
        font-size: 1rem;
      }

      .floor-name {
        font-size: 0.625rem;
      }
    }
  `]
})
export class FloorSelectorComponent {
  etages = input.required<Etage[]>();
  selectedEtageId = input.required<string>();
  etageSelected = output<string>();

  selectEtage(etageId: string): void {
    this.etageSelected.emit(etageId);
  }
}
