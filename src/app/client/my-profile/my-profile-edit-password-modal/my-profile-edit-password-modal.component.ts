import {UpdatePassword} from '@app/core/models/user-model/update.password.model';
import {ToastrService} from 'ngx-toastr';
import { ChangeDetectorRef, Component, Input, ViewChild, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup, ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {AffiliateService} from '@app/core/service/affiliate-service/affiliate.service';
import {UserAffiliate} from '@app/core/models/user-affiliate-model/user.affiliate.model';
import {CommonModule} from '@angular/common';
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-my-profile-edit-password-modal',
  templateUrl: './my-profile-edit-password-modal.component.html',
  providers: [ToastrService],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class MyProfileEditPasswordModalComponent implements OnInit {
  @Input() getCurrentUser: any = [];
  public credentials: UpdatePassword = new UpdatePassword();
  public userId: number;
  updatePasswordForm: FormGroup;
  submitted = false;

  constructor(
    private modalService: NgbModal,
    private affiliateService: AffiliateService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
  }

  @ViewChild('changePasswordModal') changePasswordModal: NgbModal;

  ngOnInit(): void {
    this.loadValidations();
  }

  openPasswordModal(content, user: UserAffiliate) {
    this.submitted = false;
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
    this.updatePasswordForm.setValue({
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
    this.userId = user.id;
    // Al modal lo abre el padre desde su plantilla: ese click ensucia la
    // vista del PADRE, no la de este componente.
    this.cdr.markForCheck();
  }

  loadValidations() {
    this.updatePasswordForm = this.formBuilder.group(
      {
        current_password: ['', [Validators.required]],
        confirm_password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15),
          Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/)]],
        new_password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15),
          Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/)]],
      },
      {
        validator: passwordMatchValidator
      });
  }

  closeModals() {
    this.modalService.dismissAll();
  }

  showError(message) {
    this.toastr.error(message, 'Error!');
  }

  get change_password_controls(): { [key: string]: AbstractControl } {
    return this.updatePasswordForm.controls;
  }

  showSuccess(message) {
    this.toastr.success(message, 'Success!');
  }

  onSaveFormValues() {
    this.submitted = true;
    if (this.updatePasswordForm.invalid) {
      return;
    }

    this.credentials.password = this.updatePasswordForm.value.current_password;
    this.credentials.new_password = this.updatePasswordForm.value.new_password;
    this.credentials.confirm_password = this.updatePasswordForm.value.confirm_password;
    this.credentials.id = this.userId;

    this.affiliateService.updatePassword(this.credentials).subscribe((response) => {
      if (response.success) {
        this.showSuccess('The password has been successfully updated!');
        this.closeModals();
      } else {
        this.showError('The current password is not correct!');
      }
    });
  }

  get Pwd(): FormControl {
    return this.updatePasswordForm.get('new_password') as FormControl;
  }

  get PwdConfirm(): FormControl {
    return this.updatePasswordForm.get('confirm_password') as FormControl;
  }
}

export function passwordMatchValidator(formGroup: FormGroup) {
  const password = formGroup.get('new_password').value;
  const confirmPassword = formGroup.get('confirm_password').value;
  return password === confirmPassword ? null : {passwordMismatch: true};
}
