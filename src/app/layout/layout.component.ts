import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../core/services/auth.service';
import { MockDataService } from '../core/services/mock-data.service';

interface SidebarItem {
  icon: string;
  label: string;
  route: string;
  tooltip: string;
}

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterModule, ButtonModule, TooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layout-container">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="isSidebarCollapsed()">
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
            <i class="pi pi-building header-icon"></i>
            <h1>{{ mallName() }}</h1>
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

            @if (!authService.isAuthenticated()) {
              <p-button
                label="Me connecter"
                icon="pi pi-sign-in"
                (onClick)="navigateToLogin()"
                [outlined]="true">
              </p-button>
            } @else {
              @if (authService.currentUser(); as user) {
                <span class="user-welcome">Bienvenue, {{ user.nom }}</span>
                @if (user.role === 'boutique') {
                  <p-button
                    label="Tableau de bord"
                    icon="pi pi-th-large"
                    (onClick)="navigateToDashboard()"
                    severity="secondary">
                  </p-button>
                }
                @if (user.role === 'admin') {
                  <p-button
                    label="Administration"
                    icon="pi pi-cog"
                    (onClick)="navigateToAdmin()"
                    severity="secondary">
                  </p-button>
                }
                <p-button
                  label="Se déconnecter"
                  icon="pi pi-sign-out"
                  (onClick)="authService.logout()"
                  [text]="true"
                  severity="secondary">
                </p-button>
              }
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
      background: var(--color-background-secondary);
    }

    /* Sidebar Styles */
    .sidebar {
      display: flex;
      flex-direction: column;
      width: 240px;
      background: var(--color-background-primary);
      border-right: 1px solid var(--color-border);
      transition: width 0.3s ease;
      flex-shrink: 0;

      &.collapsed {
        width: 64px;
      }
    }

    .sidebar-header {
      padding: 1rem;
      border-bottom: 2px solid var(--color-border);
      display: flex;
      justify-content: flex-end;
    }

    .toggle-button {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.6rem;
      border-radius: 4px;
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover {
        background: var(--color-background-tertiary);
        color: var(--color-primary);
      }

      i {
        font-size: 1.25rem;
        color: inherit;
      }
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }

    .sidebar-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem;
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: all 0.2s;
      white-space: nowrap;
      overflow: hidden;

      i {
        font-size: 1.25rem;
        flex-shrink: 0;
        color: inherit;
      }

      .sidebar-label {
        font-weight: 500;
        font-size: 0.9375rem;
      }

      &:hover {
        background: var(--color-background-tertiary);
        color: var(--color-primary);
      }

      &.active {
        background: var(--color-primary-light);
        color: var(--color-primary);
        font-weight: 600;
        border-right: 3px solid var(--color-primary);
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

    /* Header Styles */
    .main-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: var(--color-background-primary);
      border-bottom: 2px solid var(--color-border);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      flex-shrink: 0;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;

      .header-icon {
        font-size: 1.5rem;
        color: var(--color-primary);
      }

      h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--color-text-primary);
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
      background: transparent;
      border: 1px solid var(--color-border);
      cursor: pointer;
      padding: 0.625rem;
      border-radius: 6px;
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      width: 40px;
      height: 40px;

      &:hover {
        background: var(--color-background-tertiary);
        border-color: var(--color-primary);
        color: var(--color-primary);
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
export class LayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  private mockDataService = inject(MockDataService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Sidebar state
  isSidebarCollapsed = signal<boolean>(false);

  // Theme state
  currentTheme = signal<'light' | 'dark'>(this.getInitialTheme());

  // Computed values
  mallName = computed(() => this.mockDataService.centreCommercial().nom);

  // Sidebar items - configurable for future expansion
  sidebarItems = signal<SidebarItem[]>([
    {
      icon: 'pi-map',
      label: 'Plan Interactif',
      route: '/plan',
      tooltip: 'Plan interactif du centre commercial'
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

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/boutique/dashboard']);
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }
}
