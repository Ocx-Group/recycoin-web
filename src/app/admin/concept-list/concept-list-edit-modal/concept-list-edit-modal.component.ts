import {
  ChangeDetectorRef,
  Component,
  ViewChild,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup, ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {NgbModal, NgbTooltip} from '@ng-bootstrap/ng-bootstrap';
import {PaymentGroup} from "../../../core/models/payment-group-model/payment.group.model";
import {PayConcept} from "../../../core/models/concept-model/pay-concept.model";
import {ConceptList} from "../../../core/models/concept-model/concept-list.model";
import {PaymentGroupsService} from "../../../core/service/payment-groups-service/payment-groups.service";
import {ConceptService} from "../../../core/service/concept-service/concept.service";
import {TranslatePipe} from "@ngx-translate/core";
import { NgClass, CommonModule } from "@angular/common";


@Component({
  selector: 'app-concept-list-edit-modal',
  templateUrl: './concept-list-edit-modal.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TranslatePipe,
    ReactiveFormsModule,
    NgClass,
    NgbTooltip
  ]
})
export class ConceptListEditModalComponent implements OnInit {
  editConceptForm: FormGroup;
  submitted = false;
  calculateGroup: PaymentGroup[] = [];
  payConceptData: PayConcept[] = [];
  calculateConceptData: any[] = [];
  conceptListModel: ConceptList = new ConceptList();
  conceptValue = new ConceptList();

  @ViewChild('conceptEditModal') conceptEditModal: NgbModal;
  @Output('loadConceptList') loadConceptList: EventEmitter<any> =
    new EventEmitter();

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private paymentGroupService: PaymentGroupsService,
    private conceptService: ConceptService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.loadValidations();
    this.fetchCalculateConcept();
    this.fetchPayConcept();
    this.loadCalculateGroupList();
  }

  editOpenModal(content, value: ConceptList) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
    this.conceptValue = value;
    this.editConceptForm.setValue({
      concept_name: this.conceptValue.name,
      calculate_group: this.conceptValue.paymentGroupId,
      paid_concept: this.conceptValue.payConcept,
      calculate_concept: this.conceptValue.calculateBy,
      compression: this.conceptValue.compression,
      equalization: this.conceptValue.equalization,
      ignore_activation: this.conceptValue.ignoreActivationOrder,
      active: this.conceptValue.active,
    });
    // Al modal lo abre el padre desde su plantilla: ese click ensucia la
    // vista del PADRE, no la de este componente.
    this.cdr.markForCheck();
  }

  closeModals() {
    this.modalService.dismissAll();
  }

  get edit_concept_controls(): { [key: string]: AbstractControl } {
    return this.editConceptForm.controls;
  }

  loadValidations() {
    this.editConceptForm = this.formBuilder.group({
      concept_name: ['', Validators.required],
      calculate_group: ['', Validators.required],
      paid_concept: ['', Validators.required],
      calculate_concept: ['', Validators.required],
      compression: [],
      equalization: [],
      ignore_activation: [],
      active: [],
    });
  }

  showSuccess(message: string) {
    this.toastr.success(message, 'Success!');
  }

  fetchPayConcept() {
    this.conceptService.getPayConceptList().subscribe((resp) => {
      this.payConceptData = resp;
      this.cdr.markForCheck();
    });
  }

  fetchCalculateConcept() {
    this.conceptService.getCalculateConceptList().subscribe((resp) => {
      this.calculateConceptData = resp;
      this.cdr.markForCheck();
    });
  }

  loadCalculateGroupList() {
    this.paymentGroupService
      .getAll()
      .subscribe((paymentGroups: PaymentGroup[]) => {
        if (paymentGroups !== null) {
          this.calculateGroup = [...paymentGroups];
          this.cdr.markForCheck();
        }

        setTimeout(() => {
        }, 500);
      });
  }

  onAddRowSave() {
    this.submitted = true;
    if (this.editConceptForm.invalid) {
      return;
    }

    this.conceptListModel.id = this.conceptValue.id;
    this.conceptListModel.name = this.editConceptForm.value.concept_name;
    this.conceptListModel.paymentGroupId =
      this.editConceptForm.value.calculate_group;
    this.conceptListModel.payConcept = this.editConceptForm.value.paid_concept;
    this.conceptListModel.calculateBy =
      this.editConceptForm.value.calculate_concept;
    this.conceptListModel.compression =
      this.editConceptForm.value.compression ?? false;
    this.conceptListModel.equalization =
      this.editConceptForm.value.equalization ?? false;
    this.conceptListModel.ignoreActivationOrder =
      this.editConceptForm.value.ignore_activation ?? false;
    this.conceptListModel.active = this.editConceptForm.value.active ?? false;


    this.conceptService
      .updateConcept(this.conceptListModel)
      .subscribe(() => {
        this.showSuccess('The concept was update successfully!');
        this.closeModals();
        this.loadConceptList.emit();
      });
  }
}
