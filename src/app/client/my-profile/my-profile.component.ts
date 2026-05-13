import { Component, OnInit, ViewChild } from '@angular/core';
import {
  NgbDropdown,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { LoginMovements } from '@app/core/models/signin-model/login-movements.model';

import { AffiliateService } from '@app/core/service/affiliate-service/affiliate.service';
import { AuthService } from '@app/core/service/authentication-service/auth.service';
import { GradingService } from '@app/core/service/grading-service/grading.service';
import { PrintService } from '@app/core/service/print-service/print.service';
import { ClipboardService } from 'ngx-clipboard';
import { ToastrService } from 'ngx-toastr';

import { Grading } from '@app/core/models/grading-model/grading.model';
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';

const header = ['Movimientos', 'IP', 'Fecha'];
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MyProfileEditPasswordModalComponent } from './my-profile-edit-password-modal/my-profile-edit-password-modal.component';
import { MyProfileEditPersonalInfoModalComponent } from './my-profile-edit-personal-info-modal/my-profile-edit-personal-info-modal.component';
import { EditSecurityPinModalComponent } from './edit-security-pin-modal/edit-security-pin-modal.component';
import { SecretQuestionModalComponent } from './secret-question-modal/secret-question-modal.component';
import { ImageProfileModalComponent } from '@app/shared/components/image-profile-modal/image-profile-modal.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MyProfileEditPasswordModalComponent,
    MyProfileEditPersonalInfoModalComponent,
    EditSecurityPinModalComponent,
    SecretQuestionModalComponent,
    ImageProfileModalComponent,
    RouterLink,
    NgbDropdownItem,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
  ],
})
export class MyProfileComponent implements OnInit {
  public user: UserAffiliate = new UserAffiliate();
  public grading: Grading = new Grading();
  public userCookie: UserAffiliate;
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;

  @ViewChild('modalChildChangePassword')
  modalChildChangePassword: MyProfileEditPasswordModalComponent;
  @ViewChild('modalChildEditPersonalInfo')
  modalChildEditPersonalInfo: MyProfileEditPersonalInfoModalComponent;
  @ViewChild('modalChildSecretQuestion')
  modalChildSecretQuestion: SecretQuestionModalComponent;
  @ViewChild('modalChildImageProfile')
  modalChildImageProfile: ImageProfileModalComponent;

  constructor(
    private readonly modalService: NgbModal,
    private readonly printService: PrintService,
    private readonly clipboardService: ClipboardService,
    private readonly toastr: ToastrService,
    private readonly authService: AuthService,
    private readonly gradingService: GradingService,
    private readonly affiliateService: AffiliateService,
  ) {}

  ngOnInit(): void {
    this.getUserInfo();
  }

  openPasswordModal() {
    if (this.modalChildChangePassword) {
      this.modalChildChangePassword.openPasswordModal(
        this.modalChildChangePassword['changePasswordModal'],
        this.user,
      );
    }
  }

  openSecretQuestionModal() {
    if (this.modalChildSecretQuestion) {
      this.modalChildSecretQuestion.openSecretQuestionModal(
        this.modalChildSecretQuestion['secretQuestionModal'],
        this.user,
      );
    }
  }

  openEditPersonalInfoModal() {
    if (this.modalChildEditPersonalInfo) {
      this.modalChildEditPersonalInfo.openEditPersonalInfoModal(
        this.modalChildEditPersonalInfo['editPersonalInfoModal'],
        this.user,
      );
    }
  }

  openImageProfileModal() {
    if (this.modalChildImageProfile) {
      this.modalChildImageProfile.openImageProfileModal();
    }
  }

  getUserInfo() {
    this.userCookie = this.authService.currentUserAffiliateValue;
    this.affiliateService
      .getAffiliateById(this.userCookie.id)
      .subscribe(response => {
        if (response.success) {
          this.user = response.data;
          this.getGradingInfo(this.user.external_grading_before_id);
          this.loadLoginMovements();
        }
      });
  }

  getGradingInfo(id: number) {
    this.gradingService.getGradingById(id).subscribe(response => {
      if (response.success) {
        this.grading = response.data;
      }
    });
  }

  onPrintPdf() {
    const body = this.temp.map((items: any) => {
      const data = [items.movements, items.ip, items.date];
      return data;
    });

    this.printService.print(header, body, 'Últimos Movimientos', false);
  }

  clipBoardCopy() {
    const string = JSON.stringify(this.temp);
    this.clipboardService.copyFromContent(string);

    if (this.temp.length === 0) {
      this.toastr.info('No data to copy');
    } else {
      this.toastr.success('Copied ' + this.temp.length + ' rows successfully');
    }
  }

  loadLoginMovements() {
    this.authService.getLoginMovementsByAffiliatedId(this.user.id).subscribe({
      next: (response: LoginMovements[]) => {
        console.log(response);
        if (response !== null) {
          this.temp = response;
          this.rows = [...response];
        }
        this.loadingIndicator = false;
      },
      error: error => {
        this.toastr.error('Error loading movements');
        this.loadingIndicator = false;
      },
    });
  }
}
