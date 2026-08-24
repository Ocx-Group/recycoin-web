import { UserService } from '@app/core/service/user-service/user.service';
import { Component, ViewChild, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from '@app/core/models/user-model/user.model';
import { CommonModule } from '@angular/common';

import { TranslatePipe } from '@ngx-translate/core';
import { off } from '@angular/fire/database';
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';

@Component({
  selector: 'app-my-profile-edit-personal-info-modal',
  templateUrl: './my-profile-edit-personal-info-modal.component.html',
  styleUrls: ['./my-profile-edit-personal-info-modal.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
})
export class MyProfileEditPersonalInfoModalComponent implements OnInit {
  editPersonalInfoForm: FormGroup;
  submitted = false;
  public user: User = new User();
  @Input() personalInfo: any = [];
  @ViewChild('editPersonalInfoModal') editPersonalInfoModal: NgbModal;
  activeTab: 'profile' | 'documents' = 'profile';

  constructor(
    private readonly modalService: NgbModal,
    private readonly formBuilder: FormBuilder,
    private readonly toastr: ToastrService,
    private readonly userService: UserService,
  ) {}

  ngOnInit(): void {
    this.loadValidations();
  }

  loadValidations() {
    this.editPersonalInfoForm = this.formBuilder.group({
      user_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  openEditPersonalInfoModal(content, user: UserAffiliate) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
      centered: true,
      backdrop: 'static',
    });
    this.onSetValuesPersonalInfo(user);
  }

  get edit_personal_info_controls(): { [key: string]: AbstractControl } {
    return this.editPersonalInfoForm.controls;
  }

  showSuccess(message: string) {
    this.toastr.success(message, 'Success!');
  }

  closeModals() {
    this.modalService.dismissAll();
  }

  onSetValuesPersonalInfo(user: UserAffiliate) {
    this.editPersonalInfoForm.setValue({
      user_name: user.name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
    });
  }

  onSaveEditInfoValues() {
    this.submitted = true;
    if (this.editPersonalInfoForm.invalid) {
      return;
    }
    this.user = this.personalInfo;

    this.user.name = this.editPersonalInfoForm.value.user_name;
    this.user.last_name = this.editPersonalInfoForm.value.last_name;
    this.user.email = this.editPersonalInfoForm.value.email;
    this.user.phone = this.editPersonalInfoForm.value.phone;
    this.user.address = this.editPersonalInfoForm.value.address;
    this.userService.updateUser(this.user).subscribe(response => {
      if (response.success) {
        this.showSuccess('The user was update successfully!');
        this.closeModals();
      }
    });
  }

  protected readonly off = off;
}
