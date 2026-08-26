import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';

import {ToastrService} from 'ngx-toastr';
import {ProductAttributeService} from "../../core/service/product-attribute/product-attribute.service";
import {PrintService} from "../../core/service/print-service/print.service";
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";
import {IconsModule} from "../../shared";
import {
  AttributesListCreateModalComponent
} from "./attributes-list-create-modal/attributes-list-create-modal.component";
import {AttributesListEditModalComponent} from "./attributes-list-edit-modal/attributes-list-edit-modal.component";
import {
  AttributesListDetailsModalComponent
} from "./attributes-list-details-modal/attributes-list-details-modal.component";

const header = ['Nombre', 'Descripción', 'No. Valores', 'Posición'];

@Component({
  selector: 'app-attributes-list',
  templateUrl: './attributes-list.component.html',
  standalone: true,
  imports: [DatatableComponent,
    TranslatePipe,
    RouterLink,
    IconsModule,
    DataTableColumnDirective,
    DataTableColumnCellDirective,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownItem, AttributesListCreateModalComponent, AttributesListEditModalComponent, AttributesListDetailsModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ToastrService],
})
export class AttributesListComponent implements OnInit {
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;

  @ViewChild('table') table: DatatableComponent;

  constructor(
    private modalService: NgbModal,
    private productAttributeService: ProductAttributeService,
    private toastr: ToastrService,
    private printService: PrintService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.loadAttributesList();
  }

  createOpenModal(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.table) {
      this.scrollBarHorizontal = window.innerWidth < 1200;
      this.table.recalculate();
      this.table.recalculateColumns();
    }
  }

  getRowHeight(row) {
    return row.height;
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    const temp = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });

    this.rows = temp;
    this.table.offset.set(0);
  }

  loadAttributesList() {
    this.productAttributeService.getAll().subscribe((resp) => {
      if (resp != null) {
        this.temp = [...resp];
        this.rows = resp;
        this.loadingIndicator = false;
        this.cdr.markForCheck();
      }
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

  deleteRecordSuccess(count) {
    this.toastr.success(count + ' Records Deleted Successfully', '');
  }

  deleteRecord(id: number) {
    this.productAttributeService.delete(id).subscribe((response) => {
      if (response.success) {
        this.deleteRecordSuccess(1);
        this.loadAttributesList();
      }
    });
  }

  onPrint() {
    const body = this.temp.map((items: any) => {
      const data = [items.name, items.description, items, items.position];

      return data;
    });

    this.printService.print(header, body, 'Lista de Atributos', false);
  }
}
