import { ChangeDetectorRef, Component, ViewChild, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {ToastrService} from 'ngx-toastr';
import Swal from 'sweetalert2';
import {ConceptLevel} from "../../../core/models/concept-configuration-model/concept-level.model";
import {ConceptList} from "../../../core/models/concept-model/concept-list.model";
import {GradingService} from "../../../core/service/grading-service/grading.service";
import {
  ConceptConfigurationService
} from "../../../core/service/concept-configuration-service/concept-configuration.service";
import {FormsModule} from "@angular/forms";


@Component({
  selector: 'app-concept-list-configuration-modal',
  templateUrl: './concept-list-configuration-modal.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule
]
})
export class ConceptListConfigurationModalComponent implements OnInit {
  // conceptConfigurationForm!: FormGroup;
  submitted = false;
  dataObject: ConceptLevel[] = [];
  conceptLevel: ConceptLevel = new ConceptLevel();
  concept: ConceptList = new ConceptList();
  calificationList: any[] = [];

  @ViewChild('configurationModal') configurationModal: NgbModal;

  constructor(
    private modalService: NgbModal,
    private gradingService: GradingService,
    private conceptConfigurationService: ConceptConfigurationService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.fetchCalificationList();
  }

  addForm() {
    this.conceptLevel = new ConceptLevel();
    this.dataObject.push(this.conceptLevel);
    this.dataObject.forEach(() => {
    });
  }

  showSuccess(message: string) {
    this.toastr.success(message, 'Success!');
  }

  onAddRowSave(conceptLevel: ConceptLevel) {
    conceptLevel.conceptId = this.concept.id;
    if (conceptLevel.id === 0) {
      this.conceptConfigurationService
        .createConceptLevel(conceptLevel)
        .subscribe(() => {
          this.showSuccess('The concept level was created successfully!');
          this.loadConceptConfiguration();
        });
    } else {
      this.conceptConfigurationService
        .updateConceptLevel(conceptLevel)
        .subscribe((resp) => {
          if (resp.success)
            this.showSuccess('The concept level was update successfully!');
        });
    }
  }

  fetchCalificationList() {
    this.gradingService.getAll().subscribe((resp) => {
      if (resp !== null) {
        this.calificationList = resp;
        this.cdr.markForCheck();
      }
    });
  }

  deleteSingleRow(value, indexRow) {
    Swal.fire({
      title: 'Are you sure?',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.value) {
        this.deleteRecord(value, indexRow);
      }
    });
  }

  deleteRecord(value, indexRow) {
    if (value.id !== 0) {
      this.conceptConfigurationService.delete(value.id).subscribe((resp) => {
        if (resp.success) {
          this.deleteRecordSuccess(1);
          this.loadConceptConfiguration();
        }
      });
    } else {
      this.dataObject.splice(indexRow, 1);
    }
  }

  deleteRecordSuccess(count) {
    this.toastr.success(count + ' Records Deleted Successfully', '');
  }

  loadConceptConfiguration() {
    this.conceptConfigurationService
      .getConceptConfigurationByConceptId(this.concept.id)
      .subscribe((resp) => {
        if (resp !== null) {
          this.dataObject = resp;
          this.cdr.markForCheck();
        }
      });
  }

  configurationOpenModal(content, value) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });
    this.concept = value;
    this.conceptConfigurationService
      .getConceptConfigurationByConceptId(this.concept.id)
      .subscribe((resp) => {
        if (resp !== null) {
          this.dataObject = resp;
          this.cdr.markForCheck();
        }
      });
    // Al modal lo abre el padre desde su plantilla: ese click ensucia la
    // vista del PADRE, no la de este componente.
    this.cdr.markForCheck();
  }
}
