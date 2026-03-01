import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { GenericListComponent } from '../../../shared/components/generic-list/generic-list.component';
import { PageListLayoutComponent } from '../../../shared/components/page-list-layout/page-list-layout.component';
import { ListConfig } from '../../../shared/components/generic-list/generic-list.types';

@Component({
  selector: 'app-pending-registrations',
  imports: [
    ConfirmDialogModule,
    GenericListComponent,
    PageListLayoutComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './pending-registrations.component.html',
  styleUrl: './pending-registrations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingRegistrationsComponent implements OnInit {
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  pendingUsers = signal<User[]>([]);
  loading = signal(false);

  listConfig: ListConfig<User> = {
    emptyMessage: 'Aucune demande en attente',
    emptyIcon: 'pi-check-circle',
    columns: [
      { field: 'nom', header: 'Nom', cellType: 'text' },
      { field: 'prenom', header: 'Prénom', cellType: 'text' },
      { field: 'email', header: 'Email', cellType: 'text' },
      { field: 'createdAt', header: "Date d'inscription", cellType: 'date' },
      {
        field: 'statut',
        header: 'Statut',
        cellType: 'badge',
        badgeValue: () => 'En attente',
        badgeSeverity: () => 'warn',
      },
    ],
    actions: [
      {
        icon: 'pi-check',
        severity: 'success',
        tooltip: 'Approuver',
        action: (user) => this.approveBoutique(user),
      },
      {
        icon: 'pi-times',
        severity: 'danger',
        tooltip: 'Rejeter',
        action: (user) => this.rejectBoutique(user),
      },
    ],
  };

  ngOnInit() {
    this.loadPendingUsers();
  }

  loadPendingUsers() {
    this.loading.set(true);
    this.userService.getPendingBoutiques().subscribe({
      next: (users) => {
        this.pendingUsers.set(users);
        this.loading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les demandes en attente'
        });
        this.loading.set(false);
      }
    });
  }

  approveBoutique(user: User) {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment approuver la boutique de ${user.prenom} ${user.nom} ?`,
      header: 'Confirmer l\'approbation',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Approuver',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.userService.approveBoutique(user._id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Approuvé',
              detail: `La boutique de ${user.prenom} ${user.nom} a été approuvée`
            });
            this.loadPendingUsers();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible d\'approuver cette boutique'
            });
          }
        });
      }
    });
  }

  rejectBoutique(user: User) {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment rejeter la demande de ${user.prenom} ${user.nom} ? Cette action est irréversible.`,
      header: 'Confirmer le rejet',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Rejeter',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.userService.rejectBoutique(user._id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'info',
              summary: 'Rejeté',
              detail: `La demande de ${user.prenom} ${user.nom} a été rejetée`
            });
            this.loadPendingUsers();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de rejeter cette demande'
            });
          }
        });
      }
    });
  }

}
