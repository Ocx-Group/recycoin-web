import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {takeUntil} from "rxjs/operators";
import Swal from "sweetalert2";
import {Subject, Subscription} from "rxjs";

import {UserAffiliate} from '@app/core/models/user-affiliate-model/user.affiliate.model';
import {AuthService} from '@app/core/service/authentication-service/auth.service';
import {TicketHubService} from '@app/core/service/ticket-service/ticket-hub.service';
import {TicketMessageRequest} from '@app/core/models/ticket-model/ticket-message-request.model';
import {Ticket} from '@app/core/models/ticket-model/ticket.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-ticket-view',
    templateUrl: './ticket-view.component.html',
    styleUrls: ['./ticket-view.component.scss'],
    standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, FormsModule, RouterLink]
})
export class TicketViewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  ticket: Ticket;
  config = {
    wheelSpeed: 0.5,
    swipeEasing: true,
    minScrollbarLength: 20,
    maxScrollbarLength: 50,
  };
  user: UserAffiliate;
  newMessage: string;
  ticketMessage: TicketMessageRequest = new TicketMessageRequest();
  messages: Set<TicketMessageRequest> = new Set();

  constructor(
    private authService: AuthService,
    private ticketHubService: TicketHubService,
    private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.user = this.authService.currentUserAffiliateValue;
    this.ticketHubService.getTicket().subscribe(ticketId => {
      this.startConnection(ticketId);
    });
  }

  ngOnDestroy(): void {
    this.ticketHubService.leaveRoom(this.ticket.id);
    this.destroy$.next();
    this.destroy$.complete();
    this.messages.clear();
  }

  startConnection(ticketId: number) {
    this.ticketHubService.startConnection().then(() => {
      this.ticketHubService.joinRoom(ticketId).then();
      this.getTicketById(ticketId);
      this.receivedMessage();
    },
      error => console.error('Error al conectar o unirse a la sala:', error)
    );
  }

  showTicketDetails() {
    Swal.fire({
      title: `Detalles del Ticket ${this.ticket.id}`,
      text: this.ticket.description,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    }).then();
  }

  getTicketById(ticketId: number) {
    this.ticketHubService.getTicketById(ticketId);
    this.ticketHubService.ticketCreated.subscribe({
      next: (ticket: Ticket | null) => {
        if (ticket) {
          this.ticket = ticket;

          if (ticket.messages && ticket.messages.length > 0) {
            ticket.messages.forEach(message => this.processMessageSender(message));
          } else {
            console.log('Ticket received without messages');
          }
        } else {
          console.log('No ticket received or connection not established');
        }
      },
      error: (err) => {
        console.error('Error recibiendo ticket:', err);
      }
    });
  }

  receivedMessage(): Subscription {
    return this.ticketHubService.messageReceived.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (message: TicketMessageRequest) => this.processMessageSender(message),
      error: (err) => console.error('Error recibiendo mensajes:', err)
    });
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.ticketHubService.connectionEstablished.value) {
      this.ticketMessage.id = this.user.id;
      this.ticketMessage.ticketId = this.ticket.id;
      this.ticketMessage.userId = this.user.id;
      this.ticketMessage.messageContent = this.newMessage;
      this.ticketMessage.userName = this.user.user_name;
      this.ticketMessage.imageProfileUrl = this.user.image_profile_url;

      this.ticketHubService.sendMessage(this.ticketMessage);
      this.newMessage = '';
    } else {
      console.error('Intento de enviar mensaje con la conexión no establecida.');
    }
  }

  processMessageSender(message: TicketMessageRequest) {
    message.createdAt = new Date();

    this.messages.add(message);
    this.cdr.detectChanges();
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }

  isAdmin(userId: number): boolean {
    return userId !== this.user.id;
  }

  private scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Could not automatically scroll to the bottom', err);
    }
  }
}
