import {Component, OnInit, ViewChild, ChangeDetectionStrategy, signal} from '@angular/core';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import {ToastrService} from 'ngx-toastr';
import Swal from 'sweetalert2';
import {PaymentTransactionService} from "../../core/service/payment-transaction-service/payment-transaction.service";
import {PaymentTransaction} from "../../core/models/payment-transaction-model/payment-transaction";
import {ConfirmPaymentTransaction} from "../../core/models/payment-transaction-model/confirm-payment-transaction";
import {IconsModule} from "../../shared";
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle} from "@ng-bootstrap/ng-bootstrap";


@Component({
  selector: 'app-wire-transfer-list',
  templateUrl: './wire-transfer-list.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IconsModule,
    TranslatePipe,
    DatatableComponent,
    DataTableColumnDirective,
    DataTableColumnCellDirective,
    RouterLink,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownItem
]
})
export class WireTransferListComponent implements OnInit {
  readonly rows = signal<any[]>([]);
  temp = [];
  readonly loadingIndicator = signal<boolean>(true);
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  @ViewChild('table') table: DatatableComponent;

  constructor(private paymentTransactionService: PaymentTransactionService,
              private toast: ToastrService) {
  }

  ngOnInit() {
    this.loadAllWireTransactions();
  }

  showSuccess(message: string) {
    this.toast.success(message);
  }

  showError(message: string) {
    this.toast.error(message);
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    this.rows.set(this.temp.filter(function (d) {
      return d.userName.toLowerCase().indexOf(val) !== -1 || !val;
    }));
    this.table.offset.set(0);
  }

  loadAllWireTransactions() {
    this.paymentTransactionService.getAllWireTransactions().subscribe((data: PaymentTransaction[]) => {
      this.rows.set(data);
      this.temp = [...data];
      this.loadingIndicator.set(false);
    });
  }

  confirmPaymentTransaction(row) {
    Swal.fire({
      title: 'Confirmar pago',
      text: '¿Estás seguro de realizar el pago?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        let payment = new ConfirmPaymentTransaction();

        payment.id = row.id;
        payment.userName = row.userName;

        this.paymentTransactionService.confirmPayment(payment).subscribe({
          next: () => {
            this.showSuccess('Pago confirmado');
            this.loadAllWireTransactions();
          },
          error: (err) => {
            this.showError(err);
          },
        });
      }
    });
  }

}
