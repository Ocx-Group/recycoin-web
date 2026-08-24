import {Component, HostListener, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';

import {ClipboardService} from 'ngx-clipboard';
import {ToastrService} from 'ngx-toastr';
import {IncentiveService} from "../../core/service/incentive-service/incentive.service";
import {PrintService} from "../../core/service/print-service/print.service";
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";
import {IconsModule} from "../../shared";
import {
  IncentivesListCreateModalComponent
} from "./incentives-list-create-modal/incentives-list-create-modal.component";
import {IncentivesListEditModalComponent} from "./incentives-list-edit-modal/incentives-list-edit-modal.component";
import {
  IncentivesListDetailsModalComponent
} from "./incentives-list-details-modal/incentives-list-details-modal.component";


const header = ['Nombre del Incentivo', 'Descripción', 'Estado de Incentivo', 'Fecha de Registro'];

@Component({
  selector: 'app-incentives-list',
  templateUrl: './incentives-list.component.html',
  providers: [ToastrService],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    TranslatePipe,
    RouterLink,
    IconsModule,
    DatatableComponent,
    DataTableColumnDirective,
    DataTableColumnCellDirective,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownItem,
    IncentivesListCreateModalComponent,
    IncentivesListEditModalComponent,
    IncentivesListDetailsModalComponent
]
})
export class IncentivesListComponent implements OnInit {
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;

  @ViewChild('table') table: DatatableComponent;

  constructor(
    private modalService: NgbModal,
    private incentiveService: IncentiveService,
    private printService: PrintService,
    private clipboardService: ClipboardService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.loadIncentiveList();
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

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    // filter our data
    // update the rows
    this.rows = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // Whenever the filter changes, always go back to the first page
    this.table.offset.set(0);
  }

  createOpenModal(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });
  }

  loadIncentiveList() {
    this.incentiveService.getAll().subscribe((resp) => {
      if (resp !== null) {
        this.temp = [...resp];
        this.rows = resp;
      }

      setTimeout(() => {
        this.loadingIndicator = false;
      }, 500);
    });
  }

  onPrint() {
    const body = this.temp.map((items: any) => {
      return [
        items.name,
        items.description,
        items.status === 1 ? 'Activo' : 'Inactivo',
        items.created_at
      ];
    });

    this.printService.print(header, body, 'Lista de Incentivos', false);
  }

  clipBoardCopy() {
    const string = JSON.stringify(this.temp);
    this.clipboardService.copyFromContent(string);
    if (this.temp.length === 0) {
      this.toastr.info('No data to copy');
    } else {
      this.toastr.success('Copied ' + this.temp.length + ' rows successfully');
    }
  }

  deleteSingleRow(value) {
    Swal.fire({
      title: 'Are you sure?',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.value) {
        this.deleteRecord(value);
      }
    });
  }

  deleteRecordSuccess(count) {
    this.toastr.success(count + ' Records Deleted Successfully', '');
  }

  deleteRecord(id: number) {
    this.incentiveService.delete(id).subscribe((response) => {
      if (response.success) {
        this.deleteRecordSuccess(1);
        this.loadIncentiveList();
      }
    });
  }
}
