import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Component, ViewChild, HostListener, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import {ToastrService} from 'ngx-toastr';
import Swal from 'sweetalert2';

import {PrintService} from '../../core/service/print-service/print.service';
import {ClipboardService} from 'ngx-clipboard';
import {PaymentGroupsService} from "../../core/service/payment-groups-service/payment-groups.service";
import {PaymentGroup} from "../../core/models/payment-group-model/payment.group.model";
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";
import {IconsModule} from "../../shared";
import {
  CalculationGroupsCreateModalComponent
} from "./calculation-groups-create-modal/calculation-groups-create-modal.component";
import {
  CalculationGroupsEditModalComponent
} from "./calculation-groups-edit-modal/calculation-groups-edit-modal.component";

const header = ['Grupo de Calculo', 'Descripción', 'Fecha de Registro'];

@Component({
  selector: 'app-calculation-groups',
  templateUrl: './calculation-groups.component.html',
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
    CalculationGroupsCreateModalComponent,
    CalculationGroupsEditModalComponent
  ]
})
export class CalculationGroupsComponent implements OnInit {
  createCalculationForm: FormGroup;
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;

  @ViewChild('table') table: DatatableComponent;

  constructor(
    private modalService: NgbModal,
    private paymentGroupService: PaymentGroupsService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private printService: PrintService,
    private clipboardService: ClipboardService
  ) {
  }

  ngOnInit(): void {
    this.loadCalculationList();
    this.loadValidations();
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
    const temp = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset.set(0);
  }

  createOpenModal(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
  }

  editOpenModal(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
  }

  closeModals() {
    this.modalService.dismissAll();
  }

  loadValidations() {
    this.createCalculationForm = this.formBuilder.group({
      calculation_name: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  loadCalculationList() {
    this.paymentGroupService
      .getAll()
      .subscribe((paymentGroups: PaymentGroup[]) => {
        if (paymentGroups !== null) {
          this.temp = [...paymentGroups];
          this.rows = paymentGroups;
        }
        setTimeout(() => {
          this.loadingIndicator = false;
        }, 500);
      });
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

  deleteRecord(value) {
    this.paymentGroupService.delete(value).subscribe((response) => {
      if (response.success) {
        this.deleteRecordSuccess(1);
        this.loadCalculationList();
      }
    });
  }

  deleteRecordSuccess(count) {
    this.toastr.success(count + ' Records Deleted Successfully', '');
  }

  onPrint() {
    const body = this.temp.map((items: any) => {
      const data = [items.name, items.description, items.createdAt];
      return data;
    });

    this.printService.print(header, body, 'Lista Grupos de Calculo', false);
  }

  clipBoardCopy() {
    var string = JSON.stringify(this.temp);
    var result = this.clipboardService.copyFromContent(string);

    if (this.temp.length === 0) {
      this.toastr.info('No data to copy');
    } else {
      this.toastr.success('Copied ' + this.temp.length + ' rows successfully');
    }
  }
}
