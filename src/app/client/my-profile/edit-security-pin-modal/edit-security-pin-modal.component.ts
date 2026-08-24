import { Component, ViewChild, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AffiliateService } from '../../../core/service/affiliate-service/affiliate.service';
import { UserAffiliate } from '../../../core/models/user-affiliate-model/user.affiliate.model';
import { UpdatePassword } from '../../../core/models/user-model/update.password.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-edit-security-pin-modal',
    templateUrl: './edit-security-pin-modal.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonModule, ReactiveFormsModule]
})
export class EditSecurityPinModalComponent implements OnInit {
  editSecurityPinForm: FormGroup;
  submitted = false;
  public userId: number;
  public credentials: UpdatePassword = new UpdatePassword();

  @ViewChild('editSecurityPinModal') editSecurityPinModal: NgbModal;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private affiliateService: AffiliateService
  ) { }

  ngOnInit(): void {
    this.loadValidations();
  }

  onChangePasswordUpload() {
    this.submitted = true;
    if (this.editSecurityPinForm.invalid) {
      return;
    }

    this.credentials.password = this.editSecurityPinForm.value.currentPassword;
    this.credentials.new_password = this.editSecurityPinForm.value.pin;
    this.credentials.confirm_password = this.editSecurityPinForm.value.confirmPin;
    this.credentials.id = this.userId;

    this.affiliateService.updatePin(this.credentials).subscribe((response) => {
      if (response.success) {
        this.showSuccess('The security pin has been successfully updated!');
        this.closeModals();
      }
      else {
        this.showError('The security pin is not correct!');
      }
    });
  }

  showError(message) {
    this.toastr.error(message, 'Error!');
  }

  loadValidations() {
    this.editSecurityPinForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      pin: ['', Validators.required],
      confirmPin: ['', Validators.required],
    },
      {
        validator: passwordMatchValidator
      });
  }

  openEditPasswordUploadModal(content, user: UserAffiliate) {
    this.submitted = false;
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });

    this.editSecurityPinForm.setValue({
      currentPassword: '',
      pin: '',
      confirmPin: '',
    });
    this.userId = user.id;
  }

  get edit_security_pin_controls(): { [key: string]: AbstractControl } {
    return this.editSecurityPinForm.controls;
  }

  showSuccess(message) {
    this.toastr.success(message, 'Success!');
  }

  closeModals() {
    this.modalService.dismissAll();
  }

}

export function passwordMatchValidator(formGroup: FormGroup) {
  const password = formGroup.get('pin').value;
  const confirmPassword = formGroup.get('confirmPin').value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}
