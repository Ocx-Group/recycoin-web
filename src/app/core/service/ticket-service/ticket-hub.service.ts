import {Injectable} from '@angular/core';
import * as signalR from '@microsoft/signalr';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {HubConnectionState} from "@microsoft/signalr";

import {TicketRequest} from '../../models/ticket-model/ticketRequest.model';
import {TicketMessageRequest} from '../../models/ticket-model/ticket-message-request.model';
import {Ticket} from '../../models/ticket-model/ticket.model';
import {environment} from '@environments/environment';
import {TicketSummary} from '../../models/ticket-model/ticket-summary.model'

@Injectable({
  providedIn: 'root'
})
export class TicketHubService {
  private hubConnection: signalR.HubConnection;
  public messageReceived = new Subject<TicketMessageRequest>();
  public connectionError: Subject<string> = new Subject<string>();
  public ticketCreated: BehaviorSubject<Ticket | null> = new BehaviorSubject<Ticket | null>(null);
  public ticketSave: BehaviorSubject<number | null>;
  public ticketsReceived = new Subject<Ticket[]>();
  public connectionEstablished = new BehaviorSubject<boolean>(false);
  private urlApi: string;
  public ticketSummaries = new BehaviorSubject<TicketSummary[]>([]);
  private brandId: number;

  constructor() {
    this.brandId = 2;
    this.urlApi = environment.apis.accountServiceSignalR;
    this.startConnection().then();
    const savedTicket = localStorage.getItem('ticket');
    this.ticketSave = new BehaviorSubject<number | null>(savedTicket ? JSON.parse(savedTicket) : null);
  }

  public setTicket(ticketId: number) {
    this.ticketSave.next(ticketId);
    localStorage.setItem('ticket', JSON.stringify(ticketId));
  }

  public getTicket(): Observable<number | null> {
    return this.ticketSave.asObservable();
  }

  public async startConnection(): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.urlApi, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    try {
      await this.hubConnection.start();
      this.addMessageListener();
      this.connectionEstablished.next(true);
    } catch (error) {
      console.error(`Error al iniciar la conexión: ${error}`);
      this.connectionEstablished.next(false);
      this.connectionError.next(`Error al iniciar la conexión: ${error}`);
      throw error;
    }
  }

  private addMessageListener(): void {
    this.hubConnection.on('ReceiveMessage', (message: TicketMessageRequest) => {
      this.messageReceived.next(message);
    });

    this.hubConnection.on('TicketCreated', (ticket: Ticket) => {
      this.ticketCreated.next(ticket);
    });

    this.hubConnection.on('ReceiveTickets', (tickets: Ticket[]) => {
      this.ticketsReceived.next(tickets);
    });

    this.hubConnection.on('ReceiveTicketsForAdmin', (tickets: Ticket[]) => {
      this.ticketsReceived.next(tickets);
    });

    this.hubConnection.on('DeleteTicket', (ticket: Ticket) => {
      this.ticketCreated.next(ticket);
    })

    this.hubConnection.on('GetTicketById', (ticket: Ticket) => {
      this.ticketCreated.next(ticket);
    })

    this.hubConnection.on('ReceiveTicketSummaries', (ticketSummaries: TicketSummary[]) => {
      this.ticketSummaries.next(ticketSummaries);
    })
  }

  public async joinRoom(ticketId: number): Promise<boolean> {
    try {
      await this.hubConnection.invoke('JoinTicketRoom', ticketId);

      return true;
    } catch (error) {
      console.error(`Error al unirse a la sala: ${error}`);
      this.connectionError.next(`Error al unirse a la sala: ${error}`);

      return false;
    }
  }

  public leaveRoom(ticketId: number): void {
    this.hubConnection.invoke('LeaveTicketRoom', ticketId)
      .catch(error => console.error(`Error al salir de la sala: ${error}`));
  }

  public sendMessage(ticketMessage: TicketMessageRequest): void {
    this.hubConnection.invoke('SendMessageToTicket', ticketMessage)
      .catch(error => console.error(`Error al enviar mensaje: ${error}`));
  }

  public stopConnection(): void {
    this.hubConnection.stop()
      .catch(error => console.error(`Error al detener la conexión: ${error}`));
  }

  public createTicket(ticketRequest: TicketRequest): Promise<void> {
    if (!this.hubConnection) {
      return Promise.reject("Hub connection is not established.");
    }

    return new Promise((resolve, reject) => {
      this.hubConnection.invoke('CreateTicket', ticketRequest, this.brandId)
        .then(response => resolve(response))
        .catch(error => {
          console.error(`Error al crear el ticket: ${error}`);
          reject(error);
        });
    });
  }

  public getAllTicketsByAffiliateId(affiliateId: number): Subject<Ticket[]> {
    if (this.hubConnection.state === HubConnectionState.Connected) {
      this.hubConnection.invoke('GetAllTicketsByAffiliateId', affiliateId, this.brandId)
        .catch(error => {
          console.error(`Error retrieving tickets: ${error}`);
        });
    } else {
      console.error('Cannot send data if the connection is not in the \'Connected\' State.');
    }
    return this.ticketsReceived;
  }

  public getAllTickets(): Subject<Ticket[]> {
    if (this.hubConnection.state === HubConnectionState.Connected) {
      this.hubConnection.invoke('GetAllTickets', this.brandId)
        .catch(error => {
          console.error(`Error retrieving tickets: ${error}`);
        });
    } else {
      console.error('Cannot send data if the connection is not in the \'Connected\' State.');
    }
    return this.ticketsReceived;
  }

  public async deleteTickets(ticketIds: number[]): Promise<Ticket[] | null> {
    if (this.hubConnection.state === HubConnectionState.Connected) {
      return this.hubConnection.invoke<Ticket[] | null>('DeleteTickets', ticketIds)
        .then(tickets => {
          return tickets;
        })
        .catch(error => {
          console.error(`Error deleting tickets: ${error}`);
          throw new Error(`Error deleting tickets: ${error}`);
        });
    } else {
      console.error('Cannot delete if the connection is not in the \'Connected\' State.');
      return null;
    }
  }

  public getTicketById(ticketId: number): void {
    if (this.hubConnection.state === HubConnectionState.Connected) {
      this.hubConnection.invoke<Ticket>('GetTicketById', ticketId)
        .then(ticket => {
          if (ticket) {
            this.ticketCreated.next(ticket);
          } else {
            console.error('No ticket received');
            this.ticketCreated.next(null);
          }
        })
        .catch(error => {
          console.error(`Error retrieving ticket: ${error}`);
          this.ticketCreated.next(null);
        });
    } else {
      console.error('Connection is not in the \'Connected\' State.');
    }
  }

  public async getTicketSummariesByAffiliateId(affiliateId: number): Promise<void> {
    if (this.hubConnection.state === HubConnectionState.Connected) {
      this.hubConnection.invoke('GetTicketSummariesByAffiliateId', affiliateId, this.brandId)
        .catch(error => console.error(`Error al obtener tickets: ${error}`));
    } else {
      console.error('Connection is not in the \'Connected\' State.');
    }
  }

  public async markTicketMessagesAsRead(ticketId: number): Promise<void> {
    if (this.hubConnection.state === HubConnectionState.Connected) {
      this.hubConnection.invoke('MarkTicketMessagesAsRead', ticketId, this.brandId)
        .catch(error => console.error(`Error al marcar mensajes como leidos: ${error}`));
    } else {
      console.error('Connection is not in the \'Connected\' State.');
    }
  }

  public async getAllTicketSummaries(): Promise<void> {
    if (this.hubConnection.state === HubConnectionState.Connected) {
      this.hubConnection.invoke('GetAllTicketSummaries', this.brandId)
        .catch(error => console.error(`Error al obtener tickets: ${error}`));
    } else {
      console.error('Connection is not in the \'Connected\' State.');
    }
  }
}
