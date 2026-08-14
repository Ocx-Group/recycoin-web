import {TicketImagesRequest} from "@app/core/models/ticket-model/ticket-images-request.model";
import {TicketMessage} from "@app/core/models/ticket-model/ticket-message.model";

export class Ticket {
  id: number;
  affiliateId: number;
  categoryId: number;
  subject: string;
  status: boolean;
  isRead: boolean;
  images: TicketImagesRequest[];
  description: string;
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
  messages: TicketMessage[];
  userName: string;
  ticketImages?: TicketImagesRequest[];

  constructor() {
    this.id = 0;
    this.affiliateId = 0;
    this.categoryId = 0;
    this.subject = '';
    this.status = false;
    this.isRead = false;
    this.images = [];
    this.ticketImages = [];
    this.description = '';
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.messages = [];
    this.userName = '';
  }
}
