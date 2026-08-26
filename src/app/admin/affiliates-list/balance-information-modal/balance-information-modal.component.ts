import {UserAffiliate} from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { ChangeDetectorRef, AfterViewInit, Component, OnInit, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import {NgbModal, NgbNav, NgbNavContent, NgbNavItem, NgbNavLink, NgbNavOutlet} from '@ng-bootstrap/ng-bootstrap';

import {BalanceInformationModel1A} from '@app/core/models/wallet-model-1a/balance-information-1a.model';
import {BalanceInformationModel1B} from '@app/core/models/wallet-model-1b/balance-information-1b.model';
import {BalanceInformation} from '@app/core/models/wallet-model/balance-information.model';
import {WalletModel1AService} from '@app/core/service/wallet-model-1a-service/wallet-model-1a.service';
import {WalletModel1BService} from '@app/core/service/wallet-model-1b-service/wallet-model-1b.service';
import {WalletService} from '@app/core/service/wallet-service/wallet.service';
import {ChartComponent} from "ng-apexcharts";
import {TruncateDecimalsPipe} from "@app/shared/pipes/truncate-decimals.pipe";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-balance-information-modal',
  templateUrl: './balance-information-modal.component.html',
  styleUrls: ['./balance-information-modal.component.sass'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgbNavItem,
    ChartComponent,
    TruncateDecimalsPipe,
    NgbNavLink,
    NgbNavContent,
    TranslatePipe,
    NgbNavOutlet,
    NgbNav
  ]
})
export class BalanceInformationModalComponent implements OnInit, AfterViewInit {
  withdrawalBalance: number = 0;
  userName = '';
  balanceInformation: BalanceInformation = new BalanceInformation();
  balanceInformationModel1A: BalanceInformationModel1A = new BalanceInformationModel1A();
  balanceInformationModel1B: BalanceInformationModel1B = new BalanceInformationModel1B();
  @ViewChild('balanceInformationModal') balanceInformationModal: TemplateRef<any>;

  public pieChartOptions: any;
  public pieChartOptionsModel1A: any;
  public pieChartOptionsModel1B: any;

  constructor(private modalService: NgbModal,
              private walletModel1AService: WalletModel1AService,
              private walletModel1BService: WalletModel1BService,
              private walletService: WalletService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.pieChartOptions = {series: [], chart: {}, labels: [], responsive: [], dataLabels: {}, legend: {}};
    this.pieChartOptionsModel1A = {series: [], chart: {}, labels: [], responsive: [], dataLabels: {}, legend: {}};
    this.pieChartOptionsModel1B = {series: [], chart: {}, labels: [], responsive: [], dataLabels: {}, legend: {}};
  }

  ngAfterViewInit(): void {

  }

  initModal(userAffiliate: UserAffiliate) {
    this.modalService.open(this.balanceInformationModal, {size: 'lg', centered: true});
    this.userName = userAffiliate.user_name;
    this.getBalanceInformationModel2(userAffiliate.id);
    this.getBalanceInformationModel1A(userAffiliate.id);
    this.getBalanceInformationModel1B(userAffiliate.id);
  }

  getBalanceInformationModel2(id: number) {
    this.walletService.getBalanceInformationByAffiliateId(id).subscribe({
      next: (value: BalanceInformation) => {
        this.balanceInformation = value;
        this.cdr.markForCheck();
        this.initChartReport3();
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  getBalanceInformationModel1A(id: number) {
    this.walletModel1AService.getBalanceInformationByAffiliateId(id).subscribe({
      next: (value: BalanceInformationModel1A) => {
        this.balanceInformationModel1A = value;
        this.cdr.markForCheck();
        this.initChartModel1A();
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  getBalanceInformationModel1B(id: number) {
    this.walletModel1BService.getBalanceInformationByAffiliateId(id).subscribe({
      next: (value: BalanceInformationModel1B) => {
        this.balanceInformationModel1B = value;
        this.cdr.markForCheck();
        this.initChartModel1B();
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  private initChartReport3() {
    this.pieChartOptions = {
      series: [
        Number(this.withdrawalBalance),
        this.balanceInformation.availableBalance,
        Number(this.balanceInformation.totalCommissionsPaid),
        Number(this.balanceInformation.totalAcquisitions),
        Number(this.balanceInformation.reverseBalance)
      ],

      colors: ['#f44336', '#2196f3', '#96a2b4', '#4caf50', '#9c27b0'],
      chart: {
        type: 'donut',
        width: 200,
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      labels: [
        'Por Cobrar',
        'Saldo Disponible',
        'Total Pagado',
        'Total Adquisiciones',
        'Saldo revertido'
      ],
      responsive: [
        {
          breakpoint: 480,
          options: {
            dataLabels: {
              enabled: true,
              formatter: function (val) {
                return val + "%"
              },
              plotOptions: {
                pie: {
                  expandOnClick: false
                }
              }
            }
          },
        },
      ],
    };
  }

  private initChartModel1A() {
    this.pieChartOptionsModel1A = {
      series: [
        Number(this.withdrawalBalance),
        this.balanceInformationModel1A.availableBalance,
        Number(this.balanceInformationModel1A.totalCommissionsPaid),
        Number(this.balanceInformationModel1A.totalAcquisitions),
        Number(this.balanceInformationModel1A.reverseBalance)
      ],

      colors: ['#f44336', '#2196f3', '#96a2b4', '#4caf50', '#9c27b0'],
      chart: {
        type: 'donut',
        width: 200,
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      labels: [
        'Por Cobrar',
        'Saldo Disponible',
        'Total Pagado',
        'Total Adquisiciones',
        'Saldo revertido'
      ],
      responsive: [
        {
          breakpoint: 480,
          options: {
            dataLabels: {
              enabled: true,
              formatter: function (val) {
                return val + "%"
              },
              plotOptions: {
                pie: {
                  expandOnClick: false
                }
              }
            }
          },
        },
      ],
    };
  }

  private initChartModel1B() {
    this.pieChartOptionsModel1B = {
      series: [
        Number(this.withdrawalBalance),
        this.balanceInformationModel1B.availableBalance,
        Number(this.balanceInformationModel1B.totalCommissionsPaid),
        Number(this.balanceInformationModel1B.totalAcquisitions),
        Number(this.balanceInformationModel1B.reverseBalance)
      ],

      colors: ['#f44336', '#2196f3', '#96a2b4', '#4caf50', '#9c27b0'],
      chart: {
        type: 'donut',
        width: 200,
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      labels: [
        'Por Cobrar',
        'Saldo Disponible',
        'Total Pagado',
        'Total Adquisiciones',
        'Saldo revertido'
      ],
      responsive: [
        {
          breakpoint: 480,
          options: {
            dataLabels: {
              enabled: true,
              formatter: function (val) {
                return val + "%"
              },
              plotOptions: {
                pie: {
                  expandOnClick: false
                }
              }
            }
          },
        },
      ],
    };
  }
}
