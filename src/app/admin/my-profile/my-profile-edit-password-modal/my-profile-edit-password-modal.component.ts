import { UpdatePassword } from '../../../core/models/user-model/update.password.model';
import { ToastrService } from 'ngx-toastr';
import { ChangeDetectionStrategy, Component, Input, ViewChild, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {User} from "../../../core/models/user-model/user.model";
import {UserService} from "../../../core/service/user-service/user.service";

@Component({
    selector: 'app-my-profile-edit-password-modal',
    templateUrl: './my-profile-edit-password-modal.component.html',
    // Sin changeDetection explicito Angular 22 ya lo trata como OnPush; se
    // anota para que las auditorias de estrategia lo vean.
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ToastrService],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TranslatePipe
    ]
})
export class MyProfileEditPasswordModalComponent implements OnInit {
  @Input() getCurrentUser: any = [];
  public credentials: UpdatePassword = new UpdatePassword();
  public user: User = new User();
  updatePasswordForm: FormGroup;
  submitted = false;

  constructor(
    private modalService: NgbModal,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService
  ) {}

  @ViewChild('changePasswordModal') changePasswordModal: NgbModal;

  ngOnInit(): void {
    this.loadValidations();
  }
  openPasswordModal(content, user: User) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
    this.updatePasswordForm.setValue({
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
    this.user.id = user.id;
  }

  loadValidations() {
    this.updatePasswordForm = this.formBuilder.group(
      {
        current_password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(15),
          ],
        ],
        confirm_password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(15),
          ],
        ],
        new_password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(15),
          ],
        ],
      },
      {
        validators: this.mustMatch('new_password', 'confirm_password'),
      }
    );
  }

  closeModals() {
    this.modalService.dismissAll();
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
    this.credentials.confirm_password =
      this.updatePasswordForm.value.confirm_password;
    this.credentials.id = this.user.id;

    this.userService.updatePassword(this.credentials).subscribe((response) => {
      if (response.success) {
        this.showSuccess('The credentials is valid!');
        this.closeModals();
      }
    });
  }

  mustMatch(controlName: string, matchingControlName: string) {
    return (group: AbstractControl) => {
      const control = group.get(controlName);
      const matchingControl = group.get(matchingControlName);

      if (!control || !matchingControl) {
        return null;
      }

      if (matchingControl.errors && !matchingControl.errors.mustMatch) {
        return null;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
      return null;
    };
  }

  get Pwd(): FormControl {
    return this.updatePasswordForm.get('new_password') as FormControl;
  }

  get PwdConfirm(): FormControl {
    return this.updatePasswordForm.get('confirm_password') as FormControl;
  }
}
