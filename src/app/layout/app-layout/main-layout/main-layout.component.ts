import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { AffiliateService } from '@app/core/service/affiliate-service/affiliate.service';
import { AuthService } from '@app/core/service/authentication-service/auth.service';
import { MembershipManagerService } from '@app/core/service/membership-manager-service/membership-manager.service';
import { TermsConditionsService } from '@app/core/service/terms-conditions-service/terms-conditions.service';
import { TicketHubService } from '@app/core/service/ticket-service/ticket-hub.service';
import { ToastrService } from 'ngx-toastr';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@app/layout/header/header.component';
import { SidebarComponent } from '@app/layout/sidebar/sidebar.component';
import { RightSidebarComponent } from '@app/layout/right-sidebar/right-sidebar.component';
import { FooterComponent } from '@app/layout/footer/footer.component';
import { TermsConditionsModalComponent } from '@app/layout/terms-conditions-modal/terms-conditions-modal.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
    selector: 'app-main-layout',
    templateUrl: './main-layout.component.html',
    styleUrls: [],
    standalone: true,
    imports: [
      RouterOutlet,
      HeaderComponent,
      SidebarComponent,
      RightSidebarComponent,
      FooterComponent,
      TermsConditionsModalComponent
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MainLayoutComponent implements OnInit {
  user: UserAffiliate = new UserAffiliate();
  constructor(
    // private documentCheckService: DocumentCheckService,
    private termsConditionsService: TermsConditionsService,
    private authService: AuthService,
    private membershipManagerService: MembershipManagerService,
    private affiliateService: AffiliateService,
    private toast: ToastrService,
    private ticketHubService: TicketHubService,
  ) { }

  ngOnInit() {
    this.user = this.authService.currentUserAffiliateValue;
    // if (this.user.message_alert == 0) {
    //   this.showAlert();
    // }
  }

  ngAfterViewInit(): void {
    // if (!this.user.termsConditions) {
    //   this.showTermsConditionsModal();
    // }

    if (this.user.activation_date == null) {
      this.showMembershipManager();
    }
  }

  showMembershipManager() {
    this.membershipManagerService.show();
  }

  showTermsConditionsModal() {
    this.termsConditionsService.show();
  }

  messageReceived() {
    this.affiliateService.updateMessageAlert(this.user.id).subscribe({
      next: (value) => {
        this.showSuccess('Mensaje recibido correctamente');
        this.authService.setUserAffiliateValue(this.user);
      },
      error: (err) => {
        this.showError('Error');
      },
    })
  }

  // showAlert() {
  //   Swal.fire({
  //     icon: "info",
  //     title: 'Habilitación de Retiros de Saldo disponible a su billetera',
  //     html: `
  //           <p>Querida familia de recycoin,</p>
  //           <p>Nos complace anunciar que el próximo martes, 23 de abril, estaremos habilitando los retiros de saldo. Esta es una oportunidad para que todos nuestros miembros puedan gestionar sus recursos de manera más efectiva dentro de nuestra plataforma.</p>
  //           <p>¡Agradecemos su paciencia y confianza en nosotros! Prepárense para realizar sus retiros.</p>
  //       `,
  //     confirmButtonText: 'OK',
  //     confirmButtonColor: '#3085d6',
  //     showCancelButton: false,
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.messageReceived();
  //     }
  //   });
  // }


  showSuccess(message: string) {
    this.toast.success(message);
  }

  showError(message: string) {
    this.toast.error(message);
  }
}
