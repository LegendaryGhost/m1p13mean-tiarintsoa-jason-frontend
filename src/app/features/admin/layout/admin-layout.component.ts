import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  effect,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../core/services/auth.service';

interface SidebarItem {
  icon: string;
  label: string;
  route: string;
  tooltip: string;
}

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterModule, ButtonModule, TooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layout-container">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="isSidebarCollapsed()">
        <div class="sidebar-brand">
          @if (!isSidebarCollapsed()) {
            <div class="brand-content">
              <i class="pi pi-shield brand-icon"></i>
              <div class="brand-text">
                <span class="brand-title">Back-Office</span>
                <span class="brand-subtitle">Administration</span>
              </div>
            </div>
          } @else {
            <i class="pi pi-shield brand-icon-collapsed"></i>
          }
        </div>
        <div class="sidebar-header">
          <button
            class="toggle-button"
            (click)="toggleSidebar()"
            [pTooltip]="isSidebarCollapsed() ? 'Ouvrir le menu' : 'Fermer le menu'"
            tooltipPosition="right">
            <i [class]="isSidebarCollapsed() ? 'pi pi-angle-right' : 'pi pi-angle-left'"></i>
          </button>
        </div>

        <nav class="sidebar-nav">
          @for (item of sidebarItems(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.route === '/back-office' }"
              class="sidebar-item"
              [pTooltip]="item.tooltip"
              tooltipPosition="right">
              <i [class]="'pi ' + item.icon"></i>
              @if (!isSidebarCollapsed()) {
                <span class="sidebar-label">{{ item.label }}</span>
              }
            </a>
          }
        </nav>
      </aside>

      <!-- Main Content -->
      <div class="main-wrapper">
        <!-- Header -->
        <header class="main-header">
          <div class="header-left">
            <i class="pi pi-cog header-icon"></i>
            <h1>Administration</h1>
          </div>

          <div class="header-right">
            <!-- Theme Switcher -->
            <button
              class="theme-toggle"
              (click)="toggleTheme()"
              [pTooltip]="currentTheme() === 'dark' ? 'Mode clair' : 'Mode sombre'"
              tooltipPosition="bottom"
              [attr.aria-label]="currentTheme() === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'">
              <i [class]="currentTheme() === 'dark' ? 'pi pi-sun' : 'pi pi-moon'"></i>
            </button>

            @if (authService.currentUser(); as user) {
              <span class="user-welcome">{{ user.nom }} (Admin)</span>
              <p-button
                label="Voir le site"
                icon="pi pi-external-link"
                (onClick)="navigateToPublicSite()"
                [outlined]="true">
              </p-button>
              <p-button
                label="Se déconnecter"
                icon="pi pi-sign-out"
                (onClick)="authService.logout()"
                [text]="true"
                severity="secondary">
              </p-button>
            }
          </div>
        </header>

        <!-- Page Content -->
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: linear-gradient(135deg, var(--color-background-secondary) 0%, color-mix(in srgb, var(--color-warning) 5%, var(--color-background-secondary)) 100%);
    }

    /* Sidebar Styles - Admin Back-Office Theme */
    .sidebar {
      display: flex;
      flex-direction: column;
      width: 260px;
      background: var(--color-background-primary);
      border-right: 1px solid var(--color-border);
      box-shadow: 2px 0 12px color-mix(in srgb, var(--color-warning) 8%, transparent);
      transition: width 0.3s ease;
      flex-shrink: 0;

      &.collapsed {
        width: 72px;
      }
    }

    .sidebar-brand {
      padding: 1.25rem 1rem;
      background: linear-gradient(135deg, var(--color-background-primary) 0%, color-mix(in srgb, var(--color-warning) 8%, var(--color-background-primary)) 100%);
      border-bottom: 2px solid color-mix(in srgb, var(--color-warning) 20%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .brand-icon {
      font-size: 1.75rem;
      color: var(--color-warning);
      filter: drop-shadow(0 2px 4px color-mix(in srgb, var(--color-warning) 30%, transparent));
    }

    .brand-icon-collapsed {
      font-size: 1.5rem;
      color: var(--color-warning);
      filter: drop-shadow(0 2px 4px color-mix(in srgb, var(--color-warning) 30%, transparent));
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .brand-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--color-text-primary);
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .brand-subtitle {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    .sidebar-header {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--color-border);
      display: flex;
      justify-content: flex-end;
    }

    .toggle-button {
      background: var(--color-background-primary);
      border: 1px solid var(--color-border);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;

      &:hover {
        background: var(--color-background-tertiary);
        border-color: var(--color-warning);
        color: var(--color-warning);
        box-shadow: 0 2px 8px color-mix(in srgb, var(--color-warning) 15%, transparent);
      }

      i {
        font-size: 1.125rem;
        color: inherit;
      }
    }

    .sidebar-nav {
      flex: 1;
      padding: 0.75rem 0;
      overflow-y: auto;
    }

    .sidebar-item {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.875rem 1.25rem;
      margin: 0.25rem 0.5rem;
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: all 0.3s ease;
      white-space: nowrap;
      overflow: hidden;
      border-radius: 10px;
      position: relative;

      i {
        font-size: 1.25rem;
        flex-shrink: 0;
        color: var(--color-warning);
        transition: transform 0.3s;
      }

      .sidebar-label {
        font-weight: 500;
        font-size: 0.9375rem;
        letter-spacing: 0.3px;
      }

      &:hover {
        background: color-mix(in srgb, var(--color-warning) 10%, var(--color-background-primary));
        color: var(--color-text-primary);
        transform: translateX(4px);
        box-shadow: 0 2px 8px color-mix(in srgb, var(--color-warning) 10%, transparent);

        i {
          transform: scale(1.15);
        }
      }

      &.active {
        background: color-mix(in srgb, var(--color-warning) 15%, var(--color-background-primary));
        color: var(--color-text-primary);
        font-weight: 600;
        box-shadow: 0 2px 8px color-mix(in srgb, var(--color-warning) 20%, transparent);
        border-left: 3px solid var(--color-warning);

        i {
          color: var(--color-warning);
          transform: scale(1.1);
        }
      }
    }

    .sidebar.collapsed .sidebar-item {
      justify-content: center;
      padding: 0.875rem;
    }

    /* Main Wrapper */
    .main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Header Styles - Admin Back-Office Theme */
    .main-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: var(--color-background-primary);
      border-bottom: 2px solid color-mix(in srgb, var(--color-warning) 30%, transparent);
      box-shadow: 0 2px 8px color-mix(in srgb, var(--color-warning) 8%, transparent);
      flex-shrink: 0;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;

      .header-icon {
        font-size: 1.5rem;
        color: var(--color-warning);
        filter: drop-shadow(0 2px 4px color-mix(in srgb, var(--color-warning) 30%, transparent));
      }

      h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-text-primary);
        letter-spacing: 0.3px;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;

      .user-welcome {
        color: var(--color-text-secondary);
        font-weight: 500;
      }
    }

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

      &:hover {
        background: var(--color-background-tertiary);
        border-color: var(--color-warning);
        color: var(--color-warning);
        box-shadow: 0 2px 8px color-mix(in srgb, var(--color-warning) 15%, transparent);
      }

      i {
        font-size: 1.125rem;
        color: inherit;
      }
    }

    /* Main Content */
    .main-content {
      flex: 1;
      overflow: auto;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        z-index: 1000;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);

        &.collapsed {
          transform: translateX(-100%);
        }
      }

      .main-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
      }

      .header-right {
        flex-wrap: wrap;
        width: 100%;
      }
    }
  `]
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Sidebar state
  isSidebarCollapsed = signal<boolean>(false);

  // Theme state
  currentTheme = signal<'light' | 'dark'>(this.getInitialTheme());

  // Admin-specific sidebar items
  sidebarItems = signal<SidebarItem[]>([
    {
      icon: 'pi-th-large',
      label: 'Tableau de bord',
      route: '/back-office',
      tooltip: 'Tableau de bord administrateur'
    },
    {
      icon: 'pi-list',
      label: 'Catégories',
      route: '/back-office/categories',
      tooltip: 'Gérer les catégories'
    },
    {
      icon: 'pi-shopping-bag',
      label: 'Boutiques',
      route: '/back-office/boutiques',
      tooltip: 'Gérer les boutiques'
    },
    {
      icon: 'pi-inbox',
      label: 'Demandes',
      route: '/back-office/demandes',
      tooltip: 'Gérer les demandes de boutiques'
    },
    {
      icon: 'pi-map-marker',
      label: 'Emplacements',
      route: '/back-office/emplacements',
      tooltip: 'Gérer les emplacements'
    },
    {
      icon: 'pi-building',
      label: 'Étages',
      route: '/back-office/etages',
      tooltip: 'Gérer les étages'
    }
  ]);

  constructor() {
    // Apply theme on change
    if (this.isBrowser) {
      effect(() => {
        const theme = this.currentTheme();
        this.applyTheme(theme);
      });
    }
  }

  private getInitialTheme(): 'light' | 'dark' {
    if (!this.isBrowser) return 'light';

    // Check localStorage first
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }

    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    if (!this.isBrowser) return;

    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  toggleTheme(): void {
    this.currentTheme.update(theme => theme === 'dark' ? 'light' : 'dark');
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed.update(collapsed => !collapsed);
  }

  navigateToPublicSite(): void {
    this.router.navigate(['/']);
  }
}
