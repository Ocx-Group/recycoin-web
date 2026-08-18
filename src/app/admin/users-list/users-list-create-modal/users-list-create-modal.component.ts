import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl, ReactiveFormsModule,
} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {UserService} from "../../../core/service/user-service/user.service";
import {User} from "../../../core/models/user-model/user.model";
import {TranslatePipe} from "@ngx-translate/core";
import {NgClass, CommonModule} from "@angular/common";

@Component({
  selector: 'app-users-list-create-modal',
  templateUrl: './users-list-create-modal.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    ReactiveFormsModule,
    NgClass
  ]
})
export class UsersListCreateModalComponent implements OnInit {
  createUserForm: FormGroup;
  submitted = false;
  @Input() selectItems: any = [];

  @ViewChild('userCreateModal') userCreateModal: NgbModal;
  @Output('loadUserList') loadUserList: EventEmitter<any> = new EventEmitter();

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private userService: UserService
  ) {
  }

  get create_user_controls(): { [key: string]: AbstractControl } {
    return this.createUserForm.controls;
  }

  ngOnInit(): void {
    this.loadValidations();
  }

  showSuccess(message) {
    this.toastr.success(message, 'Success!');
  }

  showError(message) {
    this.toastr.error(message, 'Error!');
  }

  loadValidations() {
    this.createUserForm = this.formBuilder.group(
      {
        user_name: ['', Validators.required],
        name: ['', Validators.required],
        last_name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirm_password: ['', [Validators.required, Validators.minLength(6)]],
        phone: ['', Validators.required],
        rol_id: ['', Validators.required],
        status: [],
        observation: ['', Validators.required],
        address: ['', Validators.required],
      },
      {
        validators: MustMatch('password', 'confirm_password'),
      }
    );
  }

  onAddRowSave() {
    this.submitted = true;
    if (this.createUserForm.invalid) {
      return;
    }
    let user = new User();
    user.user_name = this.createUserForm.value.user_name;
    user.rol_id = this.createUserForm.value.rol_id;
    user.password = this.createUserForm.value.password;
    user.name = this.createUserForm.value.name;
    user.last_name = this.createUserForm.value.last_name;
    user.email = this.createUserForm.value.email;
    user.phone = this.createUserForm.value.phone;
    user.observation = this.createUserForm.value.observation;
    user.address = this.createUserForm.value.address;
    user.status = this.createUserForm.value.status ?? false;

    this.userService.createUser(user).subscribe({
      next: () => {
        this.showSuccess('The user was created successfully!');
        this.closeModals();
        this.loadUserList.emit();
      },
      error: (err) => {
        this.showError('Error!' + err);
      },
    });
  }

  closeModals() {
    this.modalService.dismissAll();
  }
}

export function MustMatch(controlName: string, matchingControlName: string) {
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
      matchingControl.setErrors({mustMatch: true});
    } else {
      matchingControl.setErrors(null);
    }
    return null;
  };
}
