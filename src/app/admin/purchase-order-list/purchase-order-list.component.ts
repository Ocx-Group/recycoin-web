import {Component, HostListener, ViewChild} from '@angular/core';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import {ToastrService} from 'ngx-toastr';
import {ClipboardService} from 'ngx-clipboard';
import {PrintService} from "../../core/service/print-service/print.service";
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";
import {IconsModule} from "../../shared";



const header = [
  'Afiliado',
  'Orden',
  'Fecha',
  'Método de Pago',
  'Banco',
  'Estatus',
  'Estado',
];

@Component({
  selector: 'app-purchase-order-list',
  templateUrl: './purchase-order-list.component.html',
  providers: [ToastrService],
  standalone: true,
  imports: [DatatableComponent, TranslatePipe, RouterLink, IconsModule, DataTableColumnDirective, DataTableColumnCellDirective]
})
export class PurchaseOrderListComponent {
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
    this.fetch((data) => {
      this.temp = [...data];
      this.rows = data;
      setTimeout(() => {
        this.loadingIndicator = false;
      }, 500);
    });
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
    req.open('GET', `assets/data/admin/purchase-order-data.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    // filter our data
    // update the rows
    this.rows = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  clipBoardCopy() {
    const string = JSON.stringify(this.temp);
    this.clipboardService.copyFromContent(string);
    if (this.temp.length === 0) {
      this.toastr.info('no data to copy');
    } else {
      this.toastr.success('copied ' + this.temp.length + ' rows successfully');
    }
  }

  onPrint() {
    const body = this.temp.map((items: any) => {
      return [
        items.affiliate,
        items.order,
        items.date,
        items.paidMethod,
        items.bank,
        items.status,
        items.state
      ];
    });

    this.printService.print(
      header,
      body,
      'Lista de Órdenes de Compra',
      false
    );
  }
}
