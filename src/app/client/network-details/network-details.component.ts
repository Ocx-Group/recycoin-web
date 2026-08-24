import { Component, OnInit, Renderer2, Inject, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { AuthService } from '@app/core/service/authentication-service/auth.service';
import { WalletService } from '@app/core/service/wallet-service/wallet.service';
import {StatisticsInformation} from "@app/core/models/wallet-model/statisticsInformation";

import { TruncateDecimalsPipe } from '@app/shared/pipes/truncate-decimals.pipe';
import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-network-details',
    templateUrl: './network-details.component.html',
    styleUrls: ['./network-details.component.scss'],
    standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TruncateDecimalsPipe, RouterLink]
})
export class NetworkDetailsComponent implements OnInit, OnDestroy {
  user: UserAffiliate = new UserAffiliate();
  information: StatisticsInformation = new StatisticsInformation();

  constructor(
    private walletService: WalletService,
    private authService: AuthService,
    private toastr: ToastrService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    this.user = this.authService.currentUserAffiliateValue;
    this.loadInformation();
    this.contractSidebar();
  }

  ngOnDestroy(): void {
    this.expandSidebar()
  }

  loadInformation() {
    this.walletService.getStatisticsInformationByAffiliateId(this.user.id).subscribe({
      next: (value) => {
        this.information = value;
      },
      error: (err) => {
        this.showError('Error');
      },
    })
  }

  showError(message) {
    this.toastr.error(message);
  }

  contractSidebar(): void {
    this.renderer.addClass(this.document.body, 'side-closed');
    this.renderer.addClass(this.document.body, 'submenu-closed');
  }

  expandSidebar(): void {
    this.renderer.removeClass(this.document.body, 'side-closed');
    this.renderer.removeClass(this.document.body, 'submenu-closed');
  }
}
