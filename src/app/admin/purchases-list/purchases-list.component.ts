import {Component, ElementRef, HostListener, OnInit, ViewChild,} from '@angular/core';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import {ClipboardService} from 'ngx-clipboard';
import {ToastrService} from 'ngx-toastr';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {PrintService} from "../../core/service/print-service/print.service";
import {InvoiceService} from "../../core/service/invoice-service/invoice.service";
import {PaginationRequest} from "../../core/interfaces/pagination-request";
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";
import {IconsModule} from "../../shared";
import {FormsModule} from "@angular/forms";
import {CurrencyPipe, DatePipe, NgClass, CommonModule} from "@angular/common";

const header = [
  'Afiliado',
  'Nombre y Apellido',
  'No. Factura',
  'Fecha',
  'Estado Factura',
  'Pagado',
];

@Component({
  selector: 'app-purchases-list',
  templateUrl: './purchases-list.component.html',
  providers: [ToastrService],
  standalone: true,
  imports: [CommonModule, DatatableComponent, TranslatePipe, RouterLink, IconsModule, FormsModule, NgClass, DataTableColumnDirective, DataTableColumnCellDirective, DatePipe, CurrencyPipe]
})
export class PurchasesListComponent implements OnInit {
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  startDate: string = null;
  endDate: string = null;
  selectedInvoice: any = null;
  modal: any;
  @ViewChild('detailsModal') detailsModal: ElementRef;
  @ViewChild('table') table: DatatableComponent;
  totalElements: number = 0;
  pageSize: number = 10;
  currentPage: number = 1;

  constructor(
    private toastr: ToastrService,
    private clipboardService: ClipboardService,
    private printService: PrintService,
    private invoiceService: InvoiceService,
    private modalService: NgbModal,
  ) {
  }

  ngOnInit(): void {
    this.loadData();
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

  loadData() {
    const request: PaginationRequest = {
      pageSize: this.pageSize,
      pageNumber: this.currentPage,
      startDate: this.startDate ? new Date(this.startDate) : null,
      endDate: this.endDate ? new Date(this.endDate) : null,
    };

    this.loadingIndicator = true;
    this.invoiceService.getAllInvoices(request).subscribe({
      next: response => {
        if (response?.success) {
          this.rows = response.data.items;
          this.temp = response.data.items;
          this.totalElements = response.data.totalCount;
          this.pageSize = response.data.pageSize;
          this.currentPage = response.data.currentPage;
        }
        this.loadingIndicator = false;
      },
      error: error => {
        console.error(error);
        this.loadingIndicator = false;
        this.toastr.error('Error al cargar los datos');
      },
    });
  }

  onPage(event: any) {
    this.currentPage = event.offset + 1;
    this.loadData();
  }

  onDateFilterChange() {
    if (this.startDate && this.endDate) {
      if (new Date(this.startDate) > new Date(this.endDate)) {
        this.toastr.warning(
          'La fecha de inicio no puede ser mayor que la fecha final',
        );
        return;
      }
    }
    this.loadData();
  }

  clearDateFilters() {
    this.temp = [];
    this.rows = [];
    this.startDate = null;
    this.endDate = null;
    this.loadData();
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    this.rows = this.temp.filter(function (d) {
      return (
        d.name?.toLowerCase().indexOf(val) !== -1 ||
        d.lastName?.toLowerCase().indexOf(val) !== -1 ||
        d.userName?.toLowerCase().indexOf(val) !== -1 ||
        d.id?.toString().indexOf(val) !== -1 ||
        !val
      );
    });
    this.table.offset = 0;
  }

  clipBoardCopy() {
    const string = JSON.stringify(this.temp);
    const result = this.clipboardService.copyFromContent(string);

    if (this.temp.length === 0) {
      this.toastr.info('no data to copy');
    } else if (result) {
      this.toastr.success('copied ' + this.temp.length + ' rows successfully');
    } else {
      this.toastr.error('Failed to copy data to clipboard');
    }
  }

  onPrint() {
    const body = this.temp.map((items: any) => {
      return [
        items.userName,
        `${items.name} ${items.lastName}`,
        items.id,
        items.date,
        items.status ? 'Activa' : 'Pendiente o Anulada',
        items.totalInvoice,
      ];
    });

    this.printService.print(header, body, 'Lista de Compras', false);
  }

  showDetails(invoice: any) {
    this.selectedInvoice = invoice;
    this.modal = this.modalService.open(this.detailsModal, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });
  }

  printInvoiceDetails() {
    if (!this.selectedInvoice) return;

    const header = ['Producto', 'Cantidad', 'Precio', 'Total'];

    const body = this.selectedInvoice.invoicesDetails.map(detail => [
      detail.productName,
      detail.productQuantity,
      detail.productPrice,
      detail.baseAmount,
    ]);

    this.printService.print(
      header,
      body,
      `Detalle de Compra #${this.selectedInvoice.id}`,
      true,
    );
  }

  async exportToExcel() {
    try {
      this.loadingIndicator = true;
      const startDate = this.startDate ? new Date(this.startDate) : null;
      const endDate = this.endDate ? new Date(this.endDate) : null;

      this.invoiceService.exportToExcel(startDate, endDate).subscribe({
        next: (blob: Blob) => {
          const today = new Date();
          const dateStr = today.toLocaleDateString('es-CO').replace(/\//g, '-');
          const timeStr = today.toLocaleTimeString('es-CO').replace(/:/g, '-');
          const fileName = `Lista_de_compras_${dateStr}_${timeStr}.xlsx`;

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.click();
          window.URL.revokeObjectURL(url);

          this.loadingIndicator = false;
          this.toastr.success('Excel generado exitosamente');
        },
        error: error => {
          console.error('Error al exportar el excel', error);
          this.loadingIndicator = false;
          this.toastr.error('Error al generar el excel');
        },
      });
    } catch (error) {
      console.error('Error al exportar el excel', error);
      this.toastr.error('Error al generar el excel');
      this.loadingIndicator = false;
    }
  }
}
