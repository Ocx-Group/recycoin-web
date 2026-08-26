import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ChangeDetectionStrategy,
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
import {Rol} from "../../../core/models/rol-model/rol.model";
import {TranslatePipe} from "@ngx-translate/core";
import { NgClass, CommonModule } from "@angular/common";


@Component({
  selector: 'app-users-list-edit-modal',
  templateUrl: './users-list-edit-modal.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TranslatePipe,
    ReactiveFormsModule,
    NgClass
  ]
})
export class UsersListEditModalComponent implements OnInit {
  editUserForm: FormGroup;
  submitted = false;
  user = new User();
  @Input() selectRol: Rol = new Rol();
  @ViewChild('userEditModal') userEditModal: NgbModal;
  @Output('loadUserList') loadUserList: EventEmitter<any> = new EventEmitter();

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {
  }

  get edit_user_controls(): { [key: string]: AbstractControl } {
    return this.editUserForm.controls;
  }

  editOpenModal(content, user: User) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });
    this.user = user;
    this.editUserForm.setValue({
      user_name: user.user_name,
      name: user.name,
      last_name: user.last_name,
      phone: user.phone,
      email: user.email,
      rol_id: user.rol_id,
      observation: user.observation,
      address: user.address,
      status: user.status,
    });
    // Al modal lo abre el padre desde su plantilla: ese click ensucia la
    // vista del PADRE, no la de este componente.
    this.cdr.markForCheck();
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
    this.editUserForm = this.formBuilder.group({
      user_name: ['', Validators.required],
      name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      rol_id: ['', Validators.required],
      status: [],
      observation: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  onEditRowSave() {
    this.submitted = true;
    if (this.editUserForm.invalid) {
      return;
    }
    this.user.user_name = this.editUserForm.value.user_name;
    this.user.rol_id = this.editUserForm.value.rol_id;
    this.user.name = this.editUserForm.value.name;
    this.user.last_name = this.editUserForm.value.last_name;
    this.user.email = this.editUserForm.value.email;
    this.user.phone = this.editUserForm.value.phone;
    this.user.observation = this.editUserForm.value.observation;
    this.user.address = this.editUserForm.value.address;
    this.user.status = this.editUserForm.value.status ?? false;

    this.userService.updateUser(this.user).subscribe({
      next: (value) => {
        this.showSuccess('The user was updated successfully!');
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
