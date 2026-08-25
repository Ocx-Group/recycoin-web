import {Component, HostListener, OnInit, ViewChild, ChangeDetectionStrategy, signal} from '@angular/core';

import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import {ClipboardService} from 'ngx-clipboard';
import {ToastrService} from 'ngx-toastr';
import Swal from 'sweetalert2';
import {WalletWaitService} from "../../core/service/wallet-wait-service/wallet-wait.service";
import {PrintService} from "../../core/service/print-service/print.service";
import {WalletWait} from "../../core/models/wallet-wait-model/wallet-wait.model";
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";
import {IconsModule} from "../../shared";

const header = [
  'Orden',
  'Afiliado',
  'Crédito',
  'Método de pago',
  'Banco',
  'Soporte',
  'Fecha Transacción',
  'Fecha Solicitud',
];

@Component({
  selector: 'app-wallet-refill',
  templateUrl: './wallet-refill.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    RouterLink,
    IconsModule,
    DatatableComponent,
    DataTableColumnDirective,
    DataTableColumnCellDirective
  ]
})
export class WalletRefillComponent implements OnInit {
  readonly rows = signal<any[]>([]);
  temp = [];
  readonly loadingIndicator = signal<boolean>(true);
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  @ViewChild('table') table: DatatableComponent;

  constructor(
    private walletWaitService: WalletWaitService,
    private clipboardService: ClipboardService,
    private printService: PrintService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.loadWalletWait();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    this.table.recalculate();
    this.table.recalculateColumns();
  }

  loadWalletWait() {
    this.walletWaitService.getAllWalletsWait().subscribe({
      next: (resp) => {
        this.temp = [...resp];
        this.rows.set(resp);
        this.loadingIndicator.set(false);
      },
      error: () => {
        this.showError('Error!');
      },
    });
  }

  getRowHeight(row) {
    return row.height;
  }

  showError(message: string) {
    this.toastr.error(message, 'Error!');
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    this.rows.set(this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    }));
    this.table.offset.set(0);
  }

  clipBoardCopy() {
  }

  onPrint() {
    const body = this.temp.map((items: WalletWait) => {
      return [
        items.order,
        items.affiliateId,
        items.credit,
        items.paymentMethod,
        items.bank,
        items.support,
        items.depositDate,
        items.date,
      ];
    });

    this.printService.print(header, body, 'Recarga de billetera', false);
  }

  processOption() {
    Swal.fire({
      title: 'Excuse me!',
      text: 'Are you sure about this operation? If so, click on the YES I AM SURE button.',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        result.value;
      }
    });
  }
}
