import {
  Component,
  ViewChild,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup, ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {NgbModal, NgbTooltip} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {PaymentGroup} from "../../../core/models/payment-group-model/payment.group.model";
import {PayConcept} from "../../../core/models/concept-model/pay-concept.model";
import {ConceptList} from "../../../core/models/concept-model/concept-list.model";
import {PaymentGroupsService} from "../../../core/service/payment-groups-service/payment-groups.service";
import {ConceptService} from "../../../core/service/concept-service/concept.service";
import {TranslatePipe} from "@ngx-translate/core";
import {NgClass, CommonModule} from "@angular/common";

@Component({
  selector: 'app-concept-list-create-modal',
  templateUrl: './concept-list-create-modal.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    ReactiveFormsModule,
    NgClass,
    NgbTooltip
  ]
})
export class ConceptListCreateModalComponent implements OnInit {
  createConceptForm: FormGroup;
  submitted = false;
  calculateGroup: PaymentGroup[] = [];
  payConceptData: PayConcept[] = [];
  calculateConceptData: any[] = [];
  conceptListModel: ConceptList = new ConceptList();
  greeting: string;
  @ViewChild('conceptCreateModal') conceptCreateModal: NgbModal;
  @Output('loadConceptList') loadConceptList: EventEmitter<any> =
    new EventEmitter();

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private paymentGroupService: PaymentGroupsService,
    private conceptService: ConceptService
  ) {
  }

  ngOnInit(): void {
    this.loadValidations();
    this.loadCalculateGroupList();
    this.fetchPayConcept();
    this.fetchCalculateConcept();
  }

  createOpenModal(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
  }

  closeModals() {
    this.modalService.dismissAll();
  }

  get create_concept_controls(): { [key: string]: AbstractControl } {
    return this.createConceptForm.controls;
  }

  loadValidations() {
    this.createConceptForm = this.formBuilder.group({
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

  fetchPayConcept() {
    this.conceptService.getPayConceptList().subscribe((resp) => {
      this.payConceptData = resp;
    });
  }

  fetchCalculateConcept() {
    this.conceptService.getCalculateConceptList().subscribe((resp) => {
      this.calculateConceptData = resp;
    });
  }

  loadCalculateGroupList() {
    this.paymentGroupService
      .getAll()
      .subscribe((paymentGroups: PaymentGroup[]) => {
        if (paymentGroups !== null) {
          this.calculateGroup = [...paymentGroups];
        }

        setTimeout(() => {
        }, 500);
      });
  }

  showSuccess(message: string) {
    this.toastr.success(message, 'Success!');
  }

  onAddRowSave() {
    this.submitted = true;
    if (this.createConceptForm.invalid) {
      return;
    }

    this.conceptListModel.name = this.createConceptForm.value.concept_name;
    this.conceptListModel.paymentGroupId =
      this.createConceptForm.value.calculate_group;
    this.conceptListModel.payConcept =
      this.createConceptForm.value.paid_concept;
    this.conceptListModel.calculateBy =
      this.createConceptForm.value.calculate_concept;
    this.conceptListModel.compression =
      this.createConceptForm.value.compression ?? false;
    this.conceptListModel.equalization =
      this.createConceptForm.value.equalization ?? false;
    this.conceptListModel.ignoreActivationOrder =
      this.createConceptForm.value.ignore_activation ?? false;
    this.conceptListModel.active = this.createConceptForm.value.active ?? false;


    this.conceptService
      .createConcept(this.conceptListModel)
      .subscribe((resp) => {
        this.showSuccess(this.greeting);
        this.closeModals();
        this.loadConceptList.emit();
      });
  }
}
