import { Component, ViewChild, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AffiliateService } from '@app/core/service/affiliate-service/affiliate.service';
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { SecretQuestion } from '@app/core/models/secret-question-model/secret.question.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-secret-question-modal',
    templateUrl: './secret-question-modal.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonModule, ReactiveFormsModule]
})
export class SecretQuestionModalComponent implements OnInit {
  secretQuestionForm: FormGroup;
  submitted = false;
  public userId: number;
  public secretQuestion: SecretQuestion = new SecretQuestion();
  @ViewChild('secretQuestionModal') secretQuestionModal: NgbModal;


  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private affiliateService: AffiliateService
  ) {}

  ngOnInit(): void {
    this.loadValidations();
  }

  onChangeSecretQuestionUpload() {
    this.submitted = true;
    if (this.secretQuestionForm.invalid) {
      return;
    }

    this.secretQuestion.password = this.secretQuestionForm.value.currentPassword;
    this.secretQuestion.secret_answer = this.secretQuestionForm.value.pin;
    this.secretQuestion.secret_question = this.secretQuestionForm.value.confirmPin;
    this.secretQuestion.id = this.userId;

    this.affiliateService.updateSecretQuestion(this.secretQuestion).subscribe((response) => {
      if (response.success) {
        this.showSuccess('The secret question has been successfully updated!');
        this.closeModals();
      }
      else {
        this.showError('The password is not correct!');
      }
    });
  }

  showError(message) {
    this.toastr.error(message, 'Error!');
  }

  loadValidations() {
    this.secretQuestionForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      secretQuestion: ['', Validators.required],
      secretAnswer: ['', Validators.required],
    });
  }

  openSecretQuestionModal(content, user: UserAffiliate) {
    this.submitted = false;
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });

    this.secretQuestionForm.setValue({
      currentPassword: '',
      secretQuestion: '',
      secretAnswer: '',
    });
    this.userId = user.id;
  }

  get secret_question_form(): { [key: string]: AbstractControl } {
    return this.secretQuestionForm.controls;
  }

  showSuccess(message) {
    this.toastr.success(message, 'Success!');
  }

  closeModals() {
    this.modalService.dismissAll();
  }

}


