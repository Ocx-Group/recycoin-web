import {Component, ViewChild, HostListener} from '@angular/core';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import {ToastrService} from 'ngx-toastr';
import {ClipboardService} from 'ngx-clipboard';
import {PrintService} from "../../core/service/print-service/print.service";
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";
import {IconsModule} from "../../shared";
import {NgbAlert} from "@ng-bootstrap/ng-bootstrap";
import { CommonModule } from '@angular/common';

interface Alert {
  type: string;
  message: string;
}

const ALERTS: Alert[] = [
  {
    type: 'info',
    message: '',
  },
];
const header = [
  'Afiliado',
  'Orden',
  'Fecha',
  'Método de Pago',
  'Banco',
  'Soporte',
  'Fecha Transacción',
];

@Component({
  selector: 'app-authorize-purchases',
  templateUrl: './authorize-purchases.component.html',
  providers: [ToastrService],
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    RouterLink,
    IconsModule,
    NgbAlert,
    DatatableComponent,
    DataTableColumnDirective,
    DataTableColumnCellDirective
  ]
})
export class AuthorizePurchasesComponent {
  alerts: Alert[];
  show: Boolean = true;
  linkMsj: String = 'hide';
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;

  @ViewChild('table') table: DatatableComponent;

  constructor(
    private toastr: ToastrService,
    private clipboardService: ClipboardService,
    private printService: PrintService
  ) {
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    this.table.recalculate();
    this.table.recalculateColumns();
  }

  getRowHeight(row) {
    return row.height;
  }

  fetch(cb) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/admin/authorize-purchases-data.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    const temp = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });

    this.rows = temp;
    this.table.offset = 0;
  }

  close(alert: Alert) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }

  showMsj() {
    if (this.show) {
      this.show = false;
      this.linkMsj = 'show';
    } else {
      this.show = true;
      this.linkMsj = 'hide';
    }
  }

  clipBoardCopy() {
    var string = JSON.stringify(this.temp);
    var result = this.clipboardService.copyFromContent(string);

    if (this.temp.length === 0) {
      this.toastr.info('no data to copy');
    } else {
      this.toastr.success('copied ' + this.temp.length + ' rows successfully');
    }
  }

  onPrint() {
    const body = this.temp.map((items: any) => {
      const data = [
        items.affiliate,
        items.order,
        items.date,
        items.paidMethod,
        items.bank,
        items.support,
        items.transactionDate,
      ];
      return data;
    });

    this.printService.print(
      header,
      body,
      'Lista de Ordenes por Autorizar',
      false
    );
  }
}
