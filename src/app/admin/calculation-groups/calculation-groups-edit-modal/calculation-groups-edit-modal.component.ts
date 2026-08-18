import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {PaymentGroup} from "../../../core/models/payment-group-model/payment.group.model";
import {PaymentGroupsService} from "../../../core/service/payment-groups-service/payment-groups.service";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-calculation-groups-edit-modal',
  templateUrl: './calculation-groups-edit-modal.component.html',
  providers: [ToastrService],
  standalone: true,
  imports: [CommonModule]
})
export class CalculationGroupsEditModalComponent implements OnInit {
  editCalculationForm: FormGroup;
  submitted = false;
  paymentGroup: PaymentGroup = new PaymentGroup();

  @ViewChild('calculationEditModal') calculationEditModal: NgbModal;
  @Output('loadCalculationList') loadCalculationList: EventEmitter<any> =
    new EventEmitter();

  constructor(
    private paymentGroupService: PaymentGroupsService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder
  ) {
  }

  get edit_calculation_controls(): { [key: string]: AbstractControl } {
    return this.editCalculationForm.controls;
  }

  ngOnInit(): void {
    this.loadValidations();
  }

  loadValidations() {
    this.editCalculationForm = this.formBuilder.group({
      calculation_name: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  editOpenModal(content, paymentGroup: PaymentGroup) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
    this.paymentGroup.id = paymentGroup.id;
    this.editCalculationForm.setValue({
      calculation_name: paymentGroup.name,
      description: paymentGroup.description,
    });
  }

  updateCalculationGroup() {
    this.submitted = true;
    if (this.editCalculationForm.invalid) {
      return;
    }
    this.paymentGroup.name = this.editCalculationForm.value.calculation_name;
    this.paymentGroup.description = this.editCalculationForm.value.description;
    this.paymentGroupService
      .updatePaymentGroup(this.paymentGroup)
      .subscribe((response) => {
        if (response.success) {
          this.showSuccess('The payment group was update successfully!');
          this.closeModals();
          this.loadCalculationList.emit();
        }
      });
  }

  showSuccess(message: string) {
    this.toastr.success(message, 'Success!');
  }

  closeModals() {
    this.modalService.dismissAll();
  }
}
