import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';

import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import {ToastrService} from 'ngx-toastr';
import {ProductCategoryService} from "../../core/service/product-category-service/product-category.service";
import {PrintService} from "../../core/service/print-service/print.service";
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";
import {IconsModule} from "../../shared";
import {CategoriesCreateModalComponent} from "./categories-create-modal/categories-create-modal.component";
import {CategoriesEditModalComponent} from "./categories-edit-modal/categories-edit-modal.component";


const header = ['Nombre de Categoría', 'Descripción', 'Categoría Padre'];

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    CategoriesCreateModalComponent,
    CategoriesEditModalComponent
]
})
export class CategoriesComponent implements OnInit {
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  properties: any = [];
  scrollBarHorizontal = window.innerWidth < 1200;

  @ViewChild('table') table: DatatableComponent;

  constructor(
    private modalService: NgbModal,
    private productCategoryService: ProductCategoryService,
    private toastr: ToastrService,
    private printService: PrintService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.loadCategoryList();
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
    this.rows = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.table.offset.set(0);
  }

  createOpenModal(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });
  }

  loadCategoryList() {
    this.productCategoryService.getAll().subscribe((resp) => {
      this.temp = [...resp];
      this.rows = resp;
      this.loadingIndicator = false;
      this.cdr.markForCheck();
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
    this.productCategoryService.delete(id).subscribe((response) => {
      if (response.success) {
        this.deleteRecordSuccess(1);
        this.loadCategoryList();
      }
    });
  }

  onPrint() {
    const body = this.temp.map((items: any) => {
      return [items.name, items.description, items.category];
    });

    this.printService.print(header, body, 'Lista de Categorías', false);
  }
}
