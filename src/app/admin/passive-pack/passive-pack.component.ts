import {Component, HostListener, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import {map} from 'rxjs/operators';
import {InvoiceService} from "../../core/service/invoice-service/invoice.service";
import {PaginationRequest} from "../../core/interfaces/pagination-request";
import {Invoice} from "../../core/models/invoice-model/invoice.model";
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";
import {IconsModule} from "../../shared";
import {PassivePackDetailsComponent} from "./passive-pack-details/passive-pack-details/passive-pack-details.component";
import {PassivePackRunPoolModalComponent} from "./passive-pack-run-pool-modal/passive-pack-run-pool-modal.component";



@Component({
  selector: 'app-passive-pack',
  templateUrl: './passive-pack.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    TranslatePipe,
    RouterLink,
    IconsModule,
    DatatableComponent,
    DataTableColumnDirective,
    DataTableColumnCellDirective,
    NgbDropdownMenu,
    NgbDropdown,
    NgbDropdownItem,
    NgbDropdownToggle,
    PassivePackDetailsComponent,
    PassivePackRunPoolModalComponent
]
})
export class PassivePackComponent implements OnInit {
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  pageSize: number = 10;
  currentPage: number = 1;
  startDate: string = null;
  endDate: string = null;
  @ViewChild('table') table: DatatableComponent;

  constructor(
    private modalService: NgbModal,
    private invoiceService: InvoiceService,
  ) {
  }

  ngOnInit(): void {
    this.loadInvoiceList();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.table) {
      this.scrollBarHorizontal = window.innerWidth < 1200;
      this.table.recalculate();
      this.table.recalculateColumns();
    }
  }

  loadInvoiceList() {
    const request: PaginationRequest = {
      pageSize: this.pageSize,
      pageNumber: this.currentPage,
      startDate: this.startDate ? new Date(this.startDate) : null,
      endDate: this.endDate ? new Date(this.endDate) : null,
    };
    this.invoiceService
      .getAllInvoices(request)
      .pipe(map((response: any) => response as Invoice[]))
      .subscribe((resp: Invoice[]) => {
        if (resp != null) {
          const data = resp
            .map(invoice => {
              return invoice.invoicesDetails.map(detail => {
                return {
                  ...detail,
                  invoiceId: invoice.id,
                  affiliate: invoice.affiliateId,
                  number: invoice.invoiceNumber,
                  status: invoice.status,
                };
              });
            })
            .flat();

          this.temp = [...data];
          this.rows = data;
          this.loadingIndicator = false;
        }
      });
  }

  getRowHeight(row) {
    return row.height;
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    this.rows = this.temp.filter(function (d) {
      return d.invoiceId.toString().toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.table.offset.set(0);
  }

  openModal(content: any, size: string = 'xl') {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: size,
    });
  }

  passivePackDetailModal(content) {
    this.openModal(content);
  }

  runPassivePackModal(content) {
    this.openModal(content);
  }
}
