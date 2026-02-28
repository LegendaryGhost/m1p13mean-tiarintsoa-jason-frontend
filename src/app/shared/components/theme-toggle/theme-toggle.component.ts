import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [TooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="theme-toggle"
      [class.theme-toggle--fixed]="standalone()"
      (click)="themeService.toggleTheme()"
      [pTooltip]="themeService.currentTheme() === 'dark' ? 'Mode clair' : 'Mode sombre'"
      tooltipPosition="bottom"
      [attr.aria-label]="themeService.currentTheme() === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'">
      <i [class]="themeService.currentTheme() === 'dark' ? 'pi pi-sun' : 'pi pi-moon'"></i>
    </button>
  `,
  styles: [`
    .theme-toggle {
      background: var(--color-background-primary);
      border: 1px solid var(--color-border);
      cursor: pointer;
      padding: 0.625rem;
      border-radius: 8px;
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      width: 40px;
      height: 40px;
      box-shadow: 0 2px 4px color-mix(in srgb, var(--color-primary) 5%, transparent);

      &:hover {
        background: var(--color-background-tertiary);
        border-color: var(--color-primary);
        color: var(--color-primary);
        box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 15%, transparent);
      }

      i {
        font-size: 1.125rem;
        color: inherit;
      }

      &--fixed {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 1000;
      }
    }
  `]
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
  standalone = input<boolean>(false);
}
