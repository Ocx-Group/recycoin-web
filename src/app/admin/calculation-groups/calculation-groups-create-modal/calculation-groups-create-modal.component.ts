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
import {ToastrService} from 'ngx-toastr';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {TranslatePipe} from "@ngx-translate/core";
import {NgClass, CommonModule} from "@angular/common";
import {PaymentGroup} from "../../../core/models/payment-group-model/payment.group.model";
import {PaymentGroupsService} from "../../../core/service/payment-groups-service/payment-groups.service";

@Component({
  selector: 'app-calculation-groups-create-modal',
  templateUrl: './calculation-groups-create-modal.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    ReactiveFormsModule,
    NgClass
  ]
})
export class CalculationGroupsCreateModalComponent implements OnInit {
  createCalculationForm: FormGroup;
  submitted = false;
  paymentGroup: PaymentGroup = new PaymentGroup();

  @ViewChild('calculationCreateModal') calculationCreateModal: NgbModal;
  @Output('loadCalculationList') loadCalculationList: EventEmitter<any> =
    new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private paymentGroupService: PaymentGroupsService,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) {
  }

  ngOnInit(): void {
    this.loadValidations();
  }

  get create_calculation_controls(): { [key: string]: AbstractControl } {
    return this.createCalculationForm.controls;
  }

  loadValidations() {
    this.createCalculationForm = this.formBuilder.group({
      calculation_name: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  showSuccess(message: string) {
    this.toastr.success(message, 'Success!');
  }

  closeModals() {
    this.modalService.dismissAll();
  }

  onAddRowSave() {
    this.submitted = true;
    if (this.createCalculationForm.invalid) {
      return;
    }

    this.paymentGroup.name = this.createCalculationForm.value.calculation_name;
    this.paymentGroup.description =
      this.createCalculationForm.value.description;
    this.paymentGroup.status = true;

    this.paymentGroupService
      .createPaymentGroup(this.paymentGroup)
      .subscribe(() => {
        this.showSuccess('The payment group was created successfully!');
        this.closeModals();
        this.loadCalculationList.emit();
      });
  }
}
