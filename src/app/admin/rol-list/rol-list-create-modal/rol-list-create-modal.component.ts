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

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {Rol} from "../../../core/models/rol-model/rol.model";
import {RolService} from "../../../core/service/rol-service/rol.service";
import {TranslatePipe} from "@ngx-translate/core";
import {NgClass, CommonModule} from "@angular/common";

@Component({
  selector: 'app-rol-list-create-modal',
  templateUrl: './rol-list-create-modal.component.html',
  providers: [ToastrService],
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    ReactiveFormsModule,
    NgClass
  ]
})
export class RolListCreateModalComponent implements OnInit {
  createRolForm: FormGroup;
  submitted = false;

  @ViewChild('rolCreateModal') rolCreateModal: NgbModal;
  @Output('loadRolList') loadRolList: EventEmitter<any> = new EventEmitter();

  constructor(
    private modalService: NgbModal,
    private rolService: RolService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService
  ) {
  }

  get create_rol_controls(): { [key: string]: AbstractControl } {
    return this.createRolForm.controls;
  }

  ngOnInit() {
    this.loadValidations();
  }

  showSuccess(message) {
    this.toastr.success(message, 'Success!');
  }

  loadValidations() {
    this.createRolForm = this.formBuilder.group({
      rol_name: ['', Validators.required],
      description: ['', Validators.required],
    });
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

  showError(message) {
    this.toastr.error(message, 'Error!');
  }

  onAddRowSave() {
    this.submitted = true;
    if (this.createRolForm.invalid) {
      return;
    }
    let rol = new Rol();
    rol.name = this.createRolForm.value.rol_name;
    rol.description = this.createRolForm.value.description;

    this.rolService.createRol(rol).subscribe({
      next: (value) => {
        this.showSuccess('The rol was created successfully!');
        this.closeModals();
        this.loadRolList.emit();
      },
      error: (err) => {
        this.showError('Error!' + err);
      },
    });
  }
}
