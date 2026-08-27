import {
  ChangeDetectorRef,
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {NgbCarousel, NgbModal, NgbSlide} from "@ng-bootstrap/ng-bootstrap";
import {ToastrService} from 'ngx-toastr';
import Swal from 'sweetalert2';
import {DatatableComponent, SelectionType} from '@swimlane/ngx-datatable';

import {TicketCategoriesService} from '@app/core/service/ticket-categories-service/ticket-categories.service';
import {CreateTicketModalComponent} from './create-ticket-modal/create-ticket-modal.component';
import {TicketHubService} from '@app/core/service/ticket-service/ticket-hub.service';
import {AuthService} from '@app/core/service/authentication-service/auth.service';
import {UserAffiliate} from '@app/core/models/user-affiliate-model/user.affiliate.model';
import {Ticket} from '@app/core/models/ticket-model/ticket.model';
import {CommonModule} from '@angular/common';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  standalone: true,
  imports: [CommonModule, NgxDatatableModule, TranslatePipe, RouterLink, NgbCarousel, CreateTicketModalComponent, NgbSlide],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TicketsComponent implements OnInit, AfterViewInit, OnDestroy {
  user: UserAffiliate = new UserAffiliate();
  public messages: Array<any> = [];
  tickets: Ticket[] = [];
  categories = [];
  selectedTicket: any = {};
  @ViewChild(CreateTicketModalComponent) private createTicketModal: CreateTicketModalComponent;
  @ViewChild('messageInput') messageInputRef: ElementRef;
  selectedTickets: Ticket[] = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  SelectionType = SelectionType;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private ticketHubService: TicketHubService,
    private ticketCategoryService: TicketCategoriesService,
    private router: Router,
    private modalService: NgbModal,
    private toast: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
  }

  async ngOnInit() {
    try {
      await this.ticketHubService.startConnection();
    } catch (error) {
      console.error('Error starting connection:', error);
    }
    this.user = this.authService.currentUserAffiliateValue;
    this.initSignalRConnection();
    this.loadTicketCategories();
  }

  ngAfterViewInit(): void {
    this.createTicketModal.reloadRequested.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.loadAllTickets();
    });
    this.showOnboardingTour().then();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.ticketHubService.stopConnection();
  }

  showSuccess(message: string) {
    this.toast.success(message);
  }

  showError(message: string) {
    this.toast.error(message);
  }

  initSignalRConnection() {
    this.ticketHubService.connectionEstablished.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((isConnected) => {
      if (isConnected) {
        this.loadAllTickets();
      } else {
        console.error('Failed to establish connection');
      }
    });
  }

  loadAllTickets() {
    this.ticketHubService.getAllTicketsByAffiliateId(this.user.id).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (tickets) => {

        this.tickets = tickets;
        this.loadingIndicator = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.showError('Error al cargar tickets.');
      }
    });
  }

  loadTicketCategories() {
    this.ticketCategoryService.getAll().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (value) => {
        this.categories = value;
        // La plantilla no nombra categories: interpola getCategoryName(id),
        // que lo lee por dentro.
        this.cdr.markForCheck();
      },
      error: () => {
        this.showError('Error al cargar las categorías.');
      },
    });
  }

  openCreateTicketModal() {
    this.createTicketModal.openModal();
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.categoryName : 'Categoría no encontrada';
  }

  openTicketDetails(ticket: Ticket) {
    this.ticketHubService.setTicket(ticket.id);
    this.router.navigate(['app/tickets/message']).then();
  }

  openModal(content: any, ticket: Ticket) {
    this.selectedTicket.images = ticket.ticketImages || [];

    this.modalService.open(content, {size: 'lg', centered: true}).result.then(() => {
    });
  }

  onSelectTicket(ticket: Ticket, selected: boolean) {
    if (selected) {
      this.selectedTickets.push(ticket);
    } else {
      const index = this.selectedTickets.findIndex(t => t.id === ticket.id);
      if (index !== -1) {
        this.selectedTickets.splice(index, 1);
      }
    }
  }

  isTicketSelected(ticket: Ticket): boolean {
    return this.selectedTickets.some(t => t.id === ticket.id);
  }

  onDeleteTickets(): void {
    if (this.selectedTickets.length > 0 && this.ticketHubService.connectionEstablished) {
      const idsToDelete = this.selectedTickets.map(ticket => ticket.id);

      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Los tickets seleccionados serán eliminados.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.ticketHubService.deleteTickets(idsToDelete).then(() => {
            this.tickets = this.tickets.filter(ticket => !idsToDelete.includes(ticket.id));
            this.selectedTickets = [];
            this.cdr.markForCheck();
            this.showSuccess('Tickets eliminados exitosamente');
          }).catch(() => {
            this.showError('Error eliminando tickets');
          });
        }
      });
    } else {
      this.showError('No ha seleccionado tickets.');
    }
  }

  async showOnboardingTour(): Promise<void> {
    const steps = [
      {
        title: 'Bienvenido al sistema de tickets',
        text: 'Este tour te guiará a través de las principales características del sistema de tickets.',
        confirmButtonText: 'Siguiente &rarr;',
      },
      {
        title: 'Crear Ticket',
        text: 'Para registrar un nuevo ticket, haz clic en el botón "Crear Ticket."',
        confirmButtonText: 'Siguiente &rarr;',
      },
      {
        title: 'Gestión de Tickets',
        text: 'Después de crear un ticket, podrás verlo listado en esta sección.',
        confirmButtonText: 'Siguiente &rarr;',
      },
      {
        title: 'Iniciar un chat',
        text: 'Para iniciar un chat, haz clic en el ticket deseado o sobre el mensaje. Esto abrirá una nueva vista donde podrás enviar y recibir mensajes relacionados con el ticket.',
        confirmButtonText: 'Finalizar',
      }
    ];


    for (const step of steps) {
      await Swal.fire({
        ...step,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
      });
    }

    await Swal.fire({
      title: 'Tour completado!',
      text: 'Ahora estás más familiarizado con el sistema.',
      icon: 'success',
      confirmButtonText: '¡Listo!'
    });
  }

  onActivateEvent(event: any) {
    if (event.type === 'click' && event.event.target.type !== 'checkbox') {
      this.openTicketDetails(event.row);
    }
  }
}
