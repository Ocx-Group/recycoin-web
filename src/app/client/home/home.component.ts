import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgZone,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { AffiliateBtcService } from '@app/core/service/affiliate-btc-service/affiliate-btc.service';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';

import { AffiliateBtc } from '@app/core/models/affiliate-btc-model/affiliate-btc.model';
import { Response } from '@app/core/models/response-model/response.model';
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { BalanceInformationModel1A } from '@app/core/models/wallet-model-1a/balance-information-1a.model';
import { BalanceInformationModel1B } from '@app/core/models/wallet-model-1b/balance-information-1b.model';
import { BalanceInformation } from '@app/core/models/wallet-model/balance-information.model';
import { PurchasePerMonthDto } from '@app/core/models/wallet-model/network-purchases.model';
import { StatisticsInformation } from '@app/core/models/wallet-model/statisticsInformation';
import { AffiliateService } from '@app/core/service/affiliate-service/affiliate.service';
import { AuthService } from '@app/core/service/authentication-service/auth.service';
import { ModelsVisibilityService } from '@app/core/service/models-visibility-service/models-visibility.service';
import { WalletModel1AService } from '@app/core/service/wallet-model-1a-service/wallet-model-1a.service';
import { WalletModel1BService } from '@app/core/service/wallet-model-1b-service/wallet-model-1b.service';
import { WalletService } from '@app/core/service/wallet-service/wallet.service';
import { EChartsOption } from 'echarts';
import { ToastrService } from 'ngx-toastr';

import { TranslatePipe } from '@ngx-translate/core';
import { TruncateDecimalsPipe } from '@app/shared/pipes/truncate-decimals.pipe';
import { NgxEchartsModule, provideEchartsCore } from 'ngx-echarts';
import { ShareModalComponent } from '@app/client/home/share-modal/share-modal.component';
import { RouterLink } from '@angular/router';
import {
  WorldMapChartComponent,
  CountryData,
} from '@app/shared/components/world-map-chart/world-map-chart.component';

@Component({
  selector: 'app-main',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    NgApexchartsModule,
    TranslatePipe,
    TruncateDecimalsPipe,
    NgxEchartsModule,
    ShareModalComponent,
    RouterLink,
    WorldMapChartComponent
],
  providers: [
    provideEchartsCore({
      echarts: () => import('echarts'),
    }),
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent implements OnInit {
  public user: UserAffiliate;
  balanceInformation: BalanceInformation = new BalanceInformation();
  balanceInformationModel1A: BalanceInformationModel1A =
    new BalanceInformationModel1A();
  balanceInformationModel1B: BalanceInformationModel1B =
    new BalanceInformationModel1B();
  maps: CountryData[] = [];
  currentYearPurchases: PurchasePerMonthDto[] = [];
  previousYearPurchases: PurchasePerMonthDto[] = [];
  area_line_chart: EChartsOption;
  currentYear: number;
  previousYear: number;
  @ViewChild('chart') chart1: ChartComponent;
  canSeePaymentModels: boolean = false;
  recycoinInfo = {
    usdValue: 1250000,
    tokenAmount: 5000000,
    marketCap: 10000000,
    change24h: 5.75,
    contractAddress: '0x7c482FF834dfb546A8E48C14f3C34652E9826723',
    bnbAddress: '',
  };

  information: StatisticsInformation = new StatisticsInformation();
  public pieChartOptions: any;
  public pieChartOptionsModel1A: any;
  public pieChartOptionsModel1B: any;

  constructor(
    private readonly authService: AuthService,
    private readonly walletService: WalletService,
    private readonly toastr: ToastrService,
    private readonly affiliateService: AffiliateService,
    private readonly walletModel1AService: WalletModel1AService,
    private readonly walletModel1BService: WalletModel1BService,
    private readonly modelsVisibilityService: ModelsVisibilityService,
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef,
    private readonly affiliateBtService: AffiliateBtcService,
  ) {
    this.pieChartOptions = {
      series: [],
      chart: {},
      labels: [],
      responsive: [],
      dataLabels: {},
      legend: {},
    };
    this.pieChartOptionsModel1A = {
      series: [],
      chart: {},
      labels: [],
      responsive: [],
      dataLabels: {},
      legend: {},
    };
    this.pieChartOptionsModel1B = {
      series: [],
      chart: {},
      labels: [],
      responsive: [],
      dataLabels: {},
      legend: {},
    };

    this.currentYear = new Date().getFullYear();
    this.previousYear = this.currentYear - 1;
    this.ngOnInit();
  }

  ngOnInit() {
    // Usar signal para obtener el usuario afiliado
    const user = this.authService.userAffiliate();
    if (user?.id) {
      this.user = user;
      // Obtener el valor del computed signal directamente
      this.canSeePaymentModels =
        this.modelsVisibilityService.canUserSeePaymentModels();
      this.resetComponent();
      this.loadUserData(user.id);
    }

    this.loadLocations();
    this.getPurchasesInMyNetwork();
    this.loadInformation();
    this.loadBnbAddress();
  }

  loadUserData(userId: number) {
    this.loadBalancesWithRetry(userId, 5)
      .then(() => {
        this.ngZone.run(() => {
          this.initializeBalanceCharts();
          this.cdr.detectChanges();
        });
      })
      .catch(error => {
        console.error(
          'Failed to load balance data after multiple retries:',
          error,
        );
      });
  }

  initializeBalanceCharts() {
    try {
      this.initChartModel2();
    } catch (error) {
      console.error('Error initializing Model 2 Chart:', error);
    }
  }

  get registerUrl() {
    return `https://www.recycoin.net/welcome/${this.user.user_name.toString()}`;
  }

  initializeAreaLineChart() {
    const currentYearData = this.fillMissingMonths(this.currentYearPurchases);
    const previousYearData = this.fillMissingMonths(this.previousYearPurchases);

    this.area_line_chart = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: [this.previousYear.toString(), this.currentYear.toString()],
        textStyle: {
          color: '#9aa0ac',
          padding: [0, 5, 0, 5],
        },
      },
      toolbox: {
        show: !0,
        feature: {
          magicType: {
            show: !0,
            title: {
              line: 'Line',
              bar: 'Bar',
              stack: 'Stack',
            },
            type: ['line'],
          },
          restore: {
            show: !0,
            title: 'Restore',
          },
          saveAsImage: {
            show: !0,
            title: 'Save Image',
          },
        },
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: !1,
          data: [
            'ENE',
            'FEB',
            'MAR',
            'ABR',
            'MAY',
            'JUN',
            'JUL',
            'AGO',
            'SEP',
            'OCT',
            'NOV',
            'DIC',
          ],
          axisLabel: {
            fontSize: 10,
            color: '#9aa0ac',
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            fontSize: 10,
            color: '#9aa0ac',
          },
        },
      ],
      series: [
        {
          name: this.currentYear.toString(),
          type: 'line',
          smooth: !0,
          areaStyle: {},
          emphasis: {
            focus: 'series',
          },
          data: currentYearData,
        },
        {
          name: this.previousYear.toString(),
          type: 'line',
          smooth: !0,
          areaStyle: {},
          emphasis: {
            focus: 'series',
          },
          data: previousYearData,
        },
      ],
      color: ['#9f78ff', '#fa626b'],
    };
  }

  isBalanceInformationValid(balance: BalanceInformation): boolean {
    return (
      balance.serviceBalance !== undefined &&
      balance.availableBalance !== undefined &&
      balance.totalCommissionsPaid !== undefined &&
      balance.totalAcquisitions !== undefined &&
      balance.reverseBalance !== undefined &&
      balance.bonusAmount !== undefined
    );
  }

  private initChartModel2() {
    if (
      !this.balanceInformation ||
      !this.isBalanceInformationValid(this.balanceInformation)
    ) {
      console.error('Invalid balance information for Model 2');
      return;
    }
    this.pieChartOptions = {
      series: [
        this.balanceInformation.serviceBalance,
        this.balanceInformation.availableBalance,
        this.balanceInformation.totalCommissionsPaid,
        this.balanceInformation.totalAcquisitions,
        this.balanceInformation.reverseBalance,
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
        'Saldo de servicios',
        'Saldo Disponible',
        'Total Pagado',
        'Total Adquisiciones',
        'Saldo balance',
      ],
      responsive: [
        {
          breakpoint: 480,
          options: {
            dataLabels: {
              enabled: true,
              formatter: function (val: any) {
                return val + '%';
              },
            },
            plotOptions: {
              pie: {
                expandOnClick: false,
              },
            },
          },
        },
      ],
    };
  }

  openNewWindow(url: string) {
    window.open(url);
  }

  getPurchasesInMyNetwork() {
    this.walletService.getPurchasesInMyNetwork(this.user.id).subscribe(data => {
      if (data) {
        this.currentYearPurchases = data.currentYearPurchases;
        this.previousYearPurchases = data.previousYearPurchases;
        this.initializeAreaLineChart();
      }
    });
  }

  fillMissingMonths(yearPurchases: PurchasePerMonthDto[]): number[] {
    const monthlyData = new Array(12).fill(0);

    for (let purchase of yearPurchases) {
      monthlyData[purchase.month - 1] = purchase.totalPurchases;
    }

    return monthlyData;
  }

  getBalanceInformationModel2(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.walletService.getBalanceInformationByAffiliateId(id).subscribe({
        next: (value: BalanceInformation) => {
          console.log(value);
          this.balanceInformation = value;
          resolve();
        },
        error: err => {
          console.error('Error fetching balance information for Model 2:', err);
          reject(err);
        },
      });
    });
  }

  getBalanceInformationModel1A(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.walletModel1AService
        .getBalanceInformationByAffiliateId(id)
        .subscribe({
          next: (value: BalanceInformationModel1A) => {
            this.balanceInformationModel1A = value;
            resolve();
          },
          error: err => {
            console.error(
              'Error fetching balance information for Model 1A:',
              err,
            );
            reject(err);
          },
        });
    });
  }

  getBalanceInformationModel1B(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.walletModel1BService
        .getBalanceInformationByAffiliateId(id)
        .subscribe({
          next: (value: BalanceInformationModel1B) => {
            this.balanceInformationModel1B = value;
            resolve();
          },
          error: err => {
            console.error(
              'Error fetching balance information for Model 1B:',
              err,
            );
            reject(err);
          },
        });
    });
  }

  loadLocations() {
    this.affiliateService.getTotalAffiliatesByCountries().subscribe({
      next: value => {
        this.maps = value.data;
      },
      error: err => {
        console.error('Error fetching locations:', err);
      },
    });
  }

  private attemptLoadBalances(
    userId: number,
    retryCount: number,
    maxRetries: number,
    resolve: () => void,
    reject: (error: any) => void,
  ): void {
    Promise.all([
      this.getBalanceInformationModel2(userId),
      this.getBalanceInformationModel1A(userId),
      this.canSeePaymentModels
        ? this.getBalanceInformationModel1B(userId)
        : Promise.resolve(),
    ])
      .then(() => {
        resolve();
      })
      .catch(error => {
        if (retryCount < maxRetries) {
          setTimeout(
            () =>
              this.attemptLoadBalances(
                userId,
                retryCount + 1,
                maxRetries,
                resolve,
                reject,
              ),
            2000,
          );
        } else {
          reject(error);
        }
      });
  }

  loadBalancesWithRetry(userId: number, maxRetries: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.attemptLoadBalances(userId, 0, maxRetries, resolve, reject);
    });
  }

  resetComponent() {
    this.balanceInformation = new BalanceInformation();
    this.balanceInformationModel1A = new BalanceInformationModel1A();
    this.balanceInformationModel1B = new BalanceInformationModel1B();
    this.pieChartOptions = {
      series: [],
      chart: {},
      labels: [],
      responsive: [],
      dataLabels: {},
      legend: {},
    };
    this.pieChartOptionsModel1A = {
      series: [],
      chart: {},
      labels: [],
      responsive: [],
      dataLabels: {},
      legend: {},
    };
    this.pieChartOptionsModel1B = {
      series: [],
      chart: {},
      labels: [],
      responsive: [],
      dataLabels: {},
      legend: {},
    };
  }

  loadInformation() {
    this.walletService
      .getStatisticsInformationByAffiliateId(this.user.id)
      .subscribe({
        next: value => {
          this.information = value;
        },
        error: err => {
          console.error('Error fetching statistics information:', err);
        },
      });
  }

  loadBnbAddress() {
    this.affiliateBtService
      .getAffiliateBtcByAffiliateId(this.user.id)
      .subscribe({
        next: (value: Response & { data: AffiliateBtc[] }) => {
          if (value.success) {
            const address = value.data.reduce(
              (acc: any, item: any) => {
                if (item?.networkId === 2) {
                  acc.bnb_address = item.address;
                }
                return acc;
              },
              { bnb_address: '' },
            );

            this.recycoinInfo.bnbAddress = address.bnb_address;
          }
        },
        error: err => {
          console.error('Error fetching BNB address:', err);
        },
      });
  }

  copyToClipboard(text: string, type: string) {
    if (text != '') {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.showCopyNotification(type);
        })
        .catch(err => {
          console.error('Error al copiar:', err);
        });
    }
  }

  private showCopyNotification(type: string) {
    this.toastr.success(`${type} copiado al portapapeles`);
  }
}
