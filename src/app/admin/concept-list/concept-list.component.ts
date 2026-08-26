import { ChangeDetectorRef, Component, ViewChild, HostListener, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';

import {ClipboardService} from 'ngx-clipboard';
import {ToastrService} from 'ngx-toastr';
import Swal from 'sweetalert2';
import {ConceptService} from "../../core/service/concept-service/concept.service";
import {PrintService} from "../../core/service/print-service/print.service";
import {ConceptList} from "../../core/models/concept-model/concept-list.model";
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";
import {IconsModule} from "../../shared";
import {ConceptListCreateModalComponent} from "./concept-list-create-modal/concept-list-create-modal.component";
import {ConceptListEditModalComponent} from "./concept-list-edit-modal/concept-list-edit-modal.component";
import {ConceptListDetailsModalComponent} from "./concept-list-details-modal/concept-list-details-modal.component";
import {
  ConceptListBinaryConfigurationModalComponent
} from "./concept-list-binary-configuration-modal/concept-list-binary-configuration-modal.component";
import {
  ConceptListConfigurationModalComponent
} from "./concept-list-configuration-modal/concept-list-configuration-modal.component";


const header = [
  'Nombre del Concepto',
  'Estado del concepto',
  'Grupo de calculo',
  'Pagar concepto a',
  'Calcular concepto',
  'Compresión',
  'Igualación',
];

@Component({
  selector: 'app-concept-list',
  templateUrl: './concept-list.component.html',
  providers: [ToastrService],
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
    ConceptListCreateModalComponent,
    ConceptListEditModalComponent,
    ConceptListDetailsModalComponent,
    ConceptListBinaryConfigurationModalComponent,
    ConceptListConfigurationModalComponent
]
})
export class ConceptListComponent implements OnInit {
  rows = [];
  temp = [];
  properties: any = [];

  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;

  @ViewChild('table') table: DatatableComponent;

  constructor(
    private modalService: NgbModal,
    private conceptService: ConceptService,
    private printService: PrintService,
    private clipboardService: ClipboardService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.loadConceptList();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    if (this.table) {
      this.table.recalculate();
      this.table.recalculateColumns();
    }
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

  loadConceptList() {
    this.conceptService.getAll().subscribe((resp: ConceptList[]) => {
      if (resp !== null) {
        this.temp = [...resp];
        this.rows = resp;
        this.cdr.markForCheck();
      }

      setTimeout(() => {
        this.loadingIndicator = false;
        this.cdr.markForCheck();
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

  deleteRecordSuccess(count) {
    this.toastr.success(count + ' Records Deleted Successfully', '');
  }

  deleteRecord(id: number) {
    this.conceptService.delete(id).subscribe((response) => {
      if (response.success) {
        this.deleteRecordSuccess(1);
        this.loadConceptList();
      }
    });
  }

  onPrint() {
    const body = this.temp.map((items: any) => {
      const data = [
        items.name,
        items.active ? 'Activo' : 'Inactivo',
        items.paymentGroup.name,
        items.payConcept === 1
          ? 'Patrocinador Personal(Matrix Unilevel)'
          : 'Patrocinador de Ubicación(Matrix Forzada)',
        items.calculateBy === 1
          ? 'Calificación Igual (==)'
          : 'Calificación ó Mayor (>=)',
        items.compression ? 'Activo' : 'Inactivo',
        items.equalization ? 'Activo' : 'Inactivo',
      ];

      return data;
    });

    this.printService.print(header, body, 'Lista de Conceptos', false);
  }

  clipBoardCopy() {
    this.properties = [
      'name',
      'description',
      'status',
      'payConcept',
      'calculateBy',
      'compression',
      'equalization',
      'createdAt',
    ];

    let value = JSON.stringify(this.temp, this.properties);
    value = value.replace(/[[\]"']/g, '');
    this.clipboardService.copyFromContent(value);

    if (this.temp.length === 0) {
      this.toastr.info('No data to copy');
    } else {
      this.toastr.success('Copied ' + this.temp.length + ' rows successfully');
    }
  }
}
