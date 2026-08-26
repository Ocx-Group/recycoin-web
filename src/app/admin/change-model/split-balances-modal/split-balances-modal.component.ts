import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild, ChangeDetectionStrategy} from '@angular/core';

import Swal from 'sweetalert2';
import {InvoiceModelOneTwo} from "../../../core/models/invoice-model/invoice-model-one-two";
import {InvoiceService} from "../../../core/service/invoice-service/invoice.service";
import {ModelBalancesInvoices} from "../../../core/models/invoice-model/model-balances-invoices";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-split-balances-modal',
  templateUrl: './split-balances-modal.component.html',
  styleUrls: ['./split-balances-modal.component.sass'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    FormsModule
  ]
})
export class SplitBalancesModalComponent implements OnInit {
  @ViewChild('splitBalancesModal') splitBalancesModal: TemplateRef<any>;
  @Output() reloadRequested = new EventEmitter<void>();
  selectedInvoices: InvoiceModelOneTwo[] = [];
  totalInvoices: number = 0;
  model1aAmount: number = 0;
  model1bAmount: number = 0;
  model2Amount: number = 0;
  remainingTotal: number = 0;

  constructor(private modalService: NgbModal, private invoiceService: InvoiceService) {
  }

  ngOnInit() {

  }

  initModal() {
    this.calculateSelectedInvoicesTotal();
    this.updateRemainingTotal();
    this.modalService.open(this.splitBalancesModal, {size: 'lg', centered: true});
  }

  setInvoices(invoices: InvoiceModelOneTwo[]) {
    this.selectedInvoices = invoices;
  }

  calculateSelectedInvoicesTotal() {
    this.totalInvoices = 0;
    this.selectedInvoices.forEach(invoice => {
      this.totalInvoices += invoice.baseAmount;
    });
  }

  updateRemainingTotal() {
    let totalAssigned = this.model1aAmount + this.model1bAmount + this.model2Amount;

    if (totalAssigned > this.totalInvoices) {
      if (this.model1aAmount > 0) {
        this.model1aAmount = this.totalInvoices;
        this.model1bAmount = 0;
        this.model2Amount = 0;
      } else if (this.model1bAmount > 0) {
        this.model1bAmount = this.totalInvoices;
        this.model1aAmount = 0;
        this.model2Amount = 0;
      } else if (this.model2Amount > 0) {
        this.model2Amount = this.totalInvoices;
        this.model1aAmount = 0;
        this.model1bAmount = 0;
      }
      totalAssigned = this.totalInvoices;
    }

    this.remainingTotal = this.totalInvoices - totalAssigned;
  }

  processAndReturnBalancesForModels1A1B2() {
    if (!this.validateReturnProcess()) return;

    const request = new ModelBalancesInvoices();
    request.userName = this.selectedInvoices[0].userName;
    request.model1AAmount = this.model1aAmount;
    request.model1BAmount = this.model1bAmount;
    request.model2Amount = this.model2Amount;
    request.invoiceId = this.selectedInvoices.map(invoice => invoice.invoiceId);

    this.invoiceService.processAndReturnBalancesForModels1A1B2(request).subscribe({
      next: (response: any) => {
        const htmlContent = `
                <p><strong>Usuario:</strong> ${response.userName}</p>
                <p><strong>Modelo 1A:</strong> ${response.model1AAmount}</p>
                <p><strong>Modelo 1B:</strong> ${response.model1BAmount}</p>
                <p><strong>Modelo 2:</strong> ${response.model2Amount}</p>
                <p><strong>Facturas:</strong> ${response.invoiceId.join(', ')}</p>
            `;

        Swal.fire({
          title: 'Se devolvieron los saldos correctamente.',
          html: htmlContent,
          icon: 'success'
        }).then();

        this.reloadRequested.emit();
        this.selectedInvoices = [];
        this.modalService.dismissAll();
      },
      error: (error) => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron procesar los saldos.',
          icon: 'error'
        }).then();
      }
    });
  }

  validateReturnProcess() {
    let totalModels = this.model1aAmount + this.model1bAmount + this.model2Amount;

    if (this.totalInvoices > totalModels) {
      Swal.fire({
        title: 'Atención!',
        text: 'El monto total de las facturas es mayor al monto asignado a los modelos.',
        icon: 'warning',
        confirmButtonText: 'Ok'
      }).then();
      return false;
    }

    if (this.model1aAmount === 0 && this.model1bAmount === 0 && this.model2Amount === 0) {
      Swal.fire({
        title: 'Atención!',
        text: 'No se puede procesar la devolución de saldos si todos los montos asignados son cero.',
        icon: 'warning',
        confirmButtonText: 'Ok'
      }).then();
      return false;
    }
    return true;
  }
}
