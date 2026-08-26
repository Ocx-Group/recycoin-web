import { ChangeDetectorRef, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import {Component, ViewChild, OnInit, Output} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {
  AbstractControl,
  FormBuilder,
  FormGroup, ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {ToastrService} from 'ngx-toastr';
import {RolService} from "../../../core/service/rol-service/rol.service";
import {Rol} from "../../../core/models/rol-model/rol.model";
import {TranslatePipe} from "@ngx-translate/core";
import { NgClass, CommonModule } from "@angular/common";

@Component({
  selector: 'app-rol-list-edit-modal',
  templateUrl: './rol-list-edit-modal.component.html',
  providers: [ToastrService],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TranslatePipe,
    ReactiveFormsModule,
    NgClass
  ]
})
export class RolListEditModalComponent implements OnInit {
  rol = new Rol();
  updateRolForm: FormGroup;
  submitted = false;
  rolGlobal: Rol = new Rol();
  @ViewChild('rolUpdateModal') rolUpdateModal: NgbModal;
  @Output('loadRolList') loadRolList: EventEmitter<any> = new EventEmitter();

  constructor(
    private modalService: NgbModal,
    private rolService: RolService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
  }

  get update_rol_controls(): { [key: string]: AbstractControl } {
    return this.updateRolForm.controls;
  }

  ngOnInit() {
    this.loadValidations();
  }

  loadValidations() {
    this.updateRolForm = this.formBuilder.group({
      rol_name: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  showError(message: string) {
    this.toastr.error(message, 'Error!');
  }

  updateRol() {
    this.submitted = true;
    if (this.updateRolForm.invalid) {
      return;
    }
    this.rolGlobal.name = this.updateRolForm.value.rol_name;
    this.rolGlobal.description = this.updateRolForm.value.description;

    this.rolService.updateRol(this.rolGlobal).subscribe({
      next: (value) => {
        this.showSuccess('The rol was update successfully!');
        this.closeModals();
        this.loadRolList.emit();
      },
      error: (err) => {
        this.showError('Error!' + err);
      },
    });
  }

  showSuccess(message: string) {
    this.toastr.success(message, 'Success!');
  }

  closeModals() {
    this.modalService.dismissAll();
  }
}
