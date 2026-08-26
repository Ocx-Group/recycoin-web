import {
  ChangeDetectorRef,
  Component,
  ViewChild,
  Output,
  EventEmitter,
  HostListener,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import {ConceptList} from "../../../core/models/concept-model/concept-list.model";
import {
  ConceptConfigurationService
} from "../../../core/service/concept-configuration-service/concept-configuration.service";
import {GradingService} from "../../../core/service/grading-service/grading.service";
import {TranslatePipe} from "@ngx-translate/core";


@Component({
  selector: 'app-concept-list-details-modal',
  templateUrl: './concept-list-details-modal.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    DatatableComponent,
    DataTableColumnDirective,
    DataTableColumnCellDirective
]
})
export class ConceptListDetailsModalComponent implements OnInit {
  submitted = false;
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  conceptListModel: ConceptList = new ConceptList();
  conceptLevels: ConceptList = new ConceptList();
  calificationList: any[] = [];

  constructor(
    private modalService: NgbModal,
    private conceptConfigurationService: ConceptConfigurationService,
    private gradingService: GradingService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.fetchCalificationList();
  }

  @ViewChild('table') table: DatatableComponent;
  @ViewChild('conceptDetailsModal') conceptDetailsModal: NgbModal;
  @Output('loadConceptList') loadConceptList: EventEmitter<any> =
    new EventEmitter();

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    if (this.table) {
      this.table.recalculate();
      this.table.recalculateColumns();
    }
  }

  detailsOpenModal(content, row: ConceptList) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });

    this.conceptListModel = row;
    this.conceptLevels = row;
    this.conceptConfigurationService
      .getConceptConfigurationByConceptId(this.conceptLevels.id)
      .subscribe((resp) => {
        if (resp !== null) {
          this.temp = [...resp];
          this.rows = resp;
          this.loadingIndicator = false;
          this.cdr.markForCheck();
        }
      });
    // Al modal lo abre el padre desde su plantilla: ese click ensucia la
    // vista del PADRE, no la de este componente.
    this.cdr.markForCheck();
  }

  fetchCalificationList() {
    this.gradingService.getAll().subscribe((resp) => {
      if (resp !== null) {
        this.calificationList = resp;
        this.cdr.markForCheck();
      }
    });
  }

  getRowHeight(row) {
    return row.height;
  }
}
