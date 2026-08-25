import {Component, ViewChild, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  Validators,
  FormBuilder, ReactiveFormsModule,
} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {TranslatePipe} from "@ngx-translate/core";
import { NgClass, CommonModule } from "@angular/common";

@Component({
  selector: 'app-my-profile-edit-password-upload-modal',
  templateUrl: './my-profile-edit-password-upload-modal.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TranslatePipe,
    ReactiveFormsModule,
    NgClass
  ]
})
export class MyProfileEditPasswordUploadModalComponent implements OnInit {
  editPasswordUploadForm: FormGroup;
  submitted = false;
  @ViewChild('editPasswordUploadModal') editPasswordUploadModal: NgbModal;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.loadValidations();
  }

  loadValidations() {
    this.editPasswordUploadForm = this.formBuilder.group({
      password_upload: ['', Validators.required],
      confirm_password_upload: ['', Validators.required],
    });
  }

  get edit_password_upload_controls(): { [key: string]: AbstractControl } {
    return this.editPasswordUploadForm.controls;
  }

  onChangePasswordUpload() {
    this.submitted = true;
    if (this.editPasswordUploadForm.invalid) {
      return;
    }
  }
}
