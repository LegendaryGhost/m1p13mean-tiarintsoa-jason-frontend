import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-pending-registrations',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CardModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './pending-registrations.component.html',
  styleUrl: './pending-registrations.component.scss'
})
export class PendingRegistrationsComponent implements OnInit {
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  pendingUsers = signal<User[]>([]);
  loading = signal(false);

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

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
