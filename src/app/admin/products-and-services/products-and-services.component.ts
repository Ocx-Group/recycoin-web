import {Component, HostListener, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

import {ToastrService} from 'ngx-toastr';
import {ProductConfiguration} from "../../core/models/product-configuration-model/product-configuration.model";
import {ProductService} from "../../core/service/product-service/product.service";
import {PrintService} from "../../core/service/print-service/print.service";
import {ConfigurationService} from "../../core/service/configuration-service/configuration.service";
import {Product} from "../../core/models/product-model/product.model";
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";
import {IconsModule} from "../../shared";
import {
  ProductsAndServicesCreateModalComponent
} from "./products-and-services-create-modal/products-and-services-create-modal.component";
import {
  ProductsAndServicesMovementsModalComponent
} from "./products-and-services-movements-modal/products-and-services-movements-modal.component";
import {
  ProductsAndServicesEditModalComponent
} from "./products-and-services-edit-modal/products-and-services-edit-modal.component";


const header = [
  'Código del Producto',
  'Nombre del Producto',
  'Tipo',
  'Val. Comisionable',
  'Vol. Puntos',
  'Precio de Venta',
  'Existencias',
];

@Component({
  selector: 'app-products-and-services',
  templateUrl: './products-and-services.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    TranslatePipe,
    RouterLink,
    IconsModule,
    DatatableComponent,
    DataTableColumnDirective,
    DataTableColumnCellDirective,
    ProductsAndServicesCreateModalComponent,
    ProductsAndServicesMovementsModalComponent,
    ProductsAndServicesEditModalComponent,
    NgbDropdownItem,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu
]
})
export class ProductsAndServicesComponent implements OnInit {
  rows = [];
  temp = [];
  productConfiguration: ProductConfiguration = new ProductConfiguration();

  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;

  @ViewChild('table') table: DatatableComponent;

  constructor(
    private modalService: NgbModal,
    private productService: ProductService,
    private printService: PrintService,
    private toastr: ToastrService,
    private configurationService: ConfigurationService
  ) {
  }

  ngOnInit(): void {
    this.loadProductList();
    this.loadProductConfiguration();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    if (this.table) {
      this.table.recalculate();
      this.table.recalculateColumns();
    }
  }

  loadProductList() {
    this.productService.getAllProductsAdmin().subscribe((resp: Product[]) => {
      this.temp = [...resp];
      this.rows = resp;
      this.loadingIndicator = false;
    });
  }

  loadProductConfiguration() {
    this.configurationService.getProductConfiguration().subscribe((resp: ProductConfiguration) => {
      if (resp != null) {
        this.productConfiguration = resp;
      }
    });
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

  onPrint() {
    const body = this.temp.map((items: any) => {
      return [
        items.productCode,
        items.name,
        items.productType ? 'Afiliación' : 'Producto',
        'COM ' + items.commissionableValue,
        'PNT ' + items.valuePoints,
        'USD ' + items.salePrice,
        items.inventory ? '∞' : '0',
      ];
    });

    this.printService.print(header, body, 'Lista de Productos', false);
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
    this.productService.delete(id).subscribe((response) => {
      if (response.success) {
        this.deleteRecordSuccess(1);
        this.loadProductList();
      }
    });
  }
}
