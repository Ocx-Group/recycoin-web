import {Component, HostListener, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import {ProductInventory} from "../../../core/models/product-inventory-model/product-inventory.model";
import {PrintService} from "../../../core/service/print-service/print.service";
import {ProductInventoryService} from "../../../core/service/product-inventory-service/product-inventory.service";


const header = ['Ingreso', 'Egreso', 'Soporte', 'Nota', 'Tipo', 'Fecha'];

@Component({
  selector: 'app-products-and-services-movements-modal',
  templateUrl: './products-and-services-movements-modal.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    DatatableComponent,
    DataTableColumnDirective,
    DataTableColumnCellDirective
  ]
})
export class ProductsAndServicesMovementsModalComponent implements OnInit {
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;

  @ViewChild('tableMovements') tableMovements: DatatableComponent;

  constructor(
    private modalService: NgbModal,
    private printService: PrintService,
    private productInventoryService: ProductInventoryService
  ) {
  }

  @ViewChild('movementsProductsModal') movementsProductsModal: NgbModal;

  ngOnInit(): void {
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.tableMovements) {
      this.scrollBarHorizontal = window.innerWidth < 1200;
      this.tableMovements.recalculate();
      this.tableMovements.recalculateColumns();
    }
  }

  onPrint() {
    const body = this.temp.map((items: ProductInventory) => {
      return [
        items.ingress,
        items.egress,
        items.support,
        items.note,
        items.type,
        items.date
      ];
    });

    this.printService.print(
      header,
      body,
      'Lista de Movimientos del Producto',
      false
    );
  }
}
