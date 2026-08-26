import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { BalanceInformation } from '@app/core/models/wallet-model/balance-information.model';
import { DatatableComponent } from '@swimlane/ngx-datatable';

import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { WalletWithdrawalsConfiguration } from '@app/core/models/wallet-withdrawals-configuration-model/wallet-withdrawals-configuration.model';
import { AuthService } from '@app/core/service/authentication-service/auth.service';
import { ConfigurationService } from '@app/core/service/configuration-service/configuration.service';
import { WalletRequestService } from '@app/core/service/wallet-request/wallet-request.service';
import { WalletService } from '@app/core/service/wallet-service/wallet.service';
import { ToastrService } from 'ngx-toastr';
import { MatrixQualificationService } from '@app/core/service/matrix-qualification-service/matrix-qualification.service';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TranslatePipe } from '@ngx-translate/core';
import { TruncateDecimalsPipe } from '@app/shared/pipes/truncate-decimals.pipe';
import { IconsModule } from '@app/shared';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { CreateRequestsModalComponent } from '@app/client/requests/create-requests-modal/create-requests-modal.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  standalone: true,
  imports: [
    NgxDatatableModule,
    TranslatePipe,
    TruncateDecimalsPipe,
    IconsModule,
    NgbAlert,
    CreateRequestsModalComponent,
    RouterLink
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RequestsComponent implements OnInit {
  user: UserAffiliate = new UserAffiliate();
  balanceInfo: BalanceInformation = new BalanceInformation();
  walletWithdrawalsConfig: WalletWithdrawalsConfiguration =
    new WalletWithdrawalsConfiguration();
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  isReachedWithdrawalLimit: boolean = false;
  @ViewChild('table') table: DatatableComponent;

  constructor(
    private readonly walletRequestService: WalletRequestService,
    private readonly authService: AuthService,
    private readonly toastr: ToastrService,
    private readonly configurationService: ConfigurationService,
    private readonly walletService: WalletService,
    private readonly matrixQualificationService: MatrixQualificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getUserInfo();
    this.loadWalletRequest();
    this.loadWalletWithdrawalConfiguration();
    this.setAvailableBalance();
  }

  loadWalletRequest() {
    this.walletRequestService
      .getWalletRequestByAffiliateId(this.user.id)
      .subscribe({
        next: resp => {
          if (resp != null) {
            this.temp = [...resp];
            this.rows = resp;
          }
          this.loadingIndicator = false;
          this.cdr.markForCheck();
        },
        error: err => {
          this.showError('Error');
        },
      });
  }

  setAvailableBalance() {
    this.walletService
      .getBalanceInformationByAffiliateId(this.user.id)
      .subscribe(balanceInfo => {
        this.balanceInfo = balanceInfo;
        this.cdr.markForCheck();
      });
  }

  private loadWalletWithdrawalConfiguration() {
    this.configurationService.getWithdrawalsWalletConfiguration().subscribe({
      next: resp => {
        this.walletWithdrawalsConfig.minimum_amount = resp.minimum_amount;
        this.walletWithdrawalsConfig.maximum_amount = resp.maximum_amount;
        this.cdr.markForCheck();
      },
      error: _err => {
        this.showError('Error');
      },
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    this.table.recalculate();
    this.table.recalculateColumns();
  }

  getRowHeight(row) {
    return row.height;
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    const temp = this.temp.filter(function (d) {
      return d.observation.toLowerCase().includes(val) || !val;
    });

    this.rows = temp;
    this.table.offset.set(0);
  }

  getUserInfo() {
    // Usar signal para obtener el usuario afiliado
    this.user = this.authService.userAffiliate();
    if (this.user?.id) {
      this.hasReachedWithdrawalLimit(this.user.id);
    }
  }

  showError(message) {
    this.toastr.error(message);
  }

  hasReachedWithdrawalLimit(userId: number) {
    this.matrixQualificationService
      .hasReachedWithdrawalLimit(userId)
      .subscribe({
        next: value => {
          if (value.success) {
            this.isReachedWithdrawalLimit = value.data;
          } else {
            this.isReachedWithdrawalLimit = false;
            this.cdr.markForCheck();
          }
        },
        error: err => {
          console.error(err);
        },
      });
  }
}
