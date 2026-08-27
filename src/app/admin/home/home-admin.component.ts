import {AuthService} from '@app/core/service/authentication-service/auth.service';
import { ChangeDetectorRef, Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import {EChartsOption} from 'echarts';
import {WalletService} from '@app/core/service/wallet-service/wallet.service';
import {AffiliateService} from '@app/core/service/affiliate-service/affiliate.service';
import {ToastrService} from 'ngx-toastr';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexResponsive,
  ApexDataLabels,
  ApexLegend,
  ApexPlotOptions,
  ChartComponent,
} from 'ng-apexcharts';
import {UserAffiliate} from '@app/core/models/user-affiliate-model/user.affiliate.model';
import {TruncateDecimalsPipe} from '@app/shared/pipes/truncate-decimals.pipe';
import {CommonModule} from '@angular/common';
import {TranslatePipe} from "@ngx-translate/core";
import {NgxEchartsModule, provideEchartsCore} from 'ngx-echarts';
import {RouterLink} from '@angular/router';
import {WorldMapChartComponent, CountryData} from "@app/shared/components/world-map-chart/world-map-chart.component";
import {InvoiceService} from '@app/core/service/invoice-service/invoice.service';
import {MonthlyPurchases} from '@app/core/models/invoice-model/monthly-purchases.model';
import {MonthlyRegistrations} from '@app/core/models/user-affiliate-model/monthly-registrations.model';

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface MonthlyChart {
  name: string;
  color: string;
  labels: string[];
  values: number[];
  format: (value: number) => string;
}

function buildMonthlyLineChart(chart: MonthlyChart): EChartsOption {
  return {
    tooltip: {
      trigger: 'axis',
      valueFormatter: value => chart.format(Number(value)),
    },
    grid: {
      left: 60,
      right: 20,
      top: 20,
      bottom: 30,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: !1,
        data: chart.labels,
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
        name: chart.name,
        type: 'line',
        smooth: !0,
        areaStyle: {},
        emphasis: {
          focus: 'series',
        },
        data: chart.values,
      },
    ],
    color: [chart.color],
  };
}

function buildPurchasesChart(labels: string[], values: number[]): EChartsOption {
  return buildMonthlyLineChart({
    name: 'Compras',
    color: '#9f78ff',
    labels,
    values,
    format: value => `$${value.toFixed(2)}`,
  });
}

function buildAffiliatesChart(labels: string[], values: number[]): EChartsOption {
  return buildMonthlyLineChart({
    name: 'Afiliados',
    color: '#32cafe',
    labels,
    values,
    format: value => `${value}`,
  });
}

export interface ChartOptions {
  series?: ApexNonAxisChartSeries;
  chart?: ApexChart;
  responsive?: ApexResponsive[];
  labels?: any;
  colors?: string[];
  dataLabels?: ApexDataLabels;
  legend?: ApexLegend;
  plotOptions?: ApexPlotOptions;
}

@Component({
  selector: 'app-home-admin',
  templateUrl: './home-admin.component.html',
  styleUrls: ['./home-admin.component.scss'],
  standalone: true,
  imports: [CommonModule, TruncateDecimalsPipe, TranslatePipe, ChartComponent, NgxEchartsModule, RouterLink, WorldMapChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideEchartsCore({
      echarts: () => import('echarts')
    })
  ]
})
export class HomeAdminComponent implements OnInit {
  public pieChartOptions: Partial<ChartOptions>;
  public avgLecChartOptions: any;
  totalMembers: number;
  commissionsPaid: number;
  walletProfit: number;
  calculatedCommissions: number;
  totalReverseBalance: number;
  adminCommissions: number;
  maps: CountryData[] = [];
  user: any;
  @ViewChild('chart') chart1: ChartComponent;
  lastRegisteredUsers: UserAffiliate[] = [];
  purchases_chart: EChartsOption = buildPurchasesChart([], []);
  affiliates_chart: EChartsOption = buildAffiliatesChart([], []);

  constructor(
    private walletService: WalletService,
    private affiliateService: AffiliateService,
    private toastr: ToastrService,
    private authService: AuthService,
    private invoiceService: InvoiceService,
    private cdr: ChangeDetectorRef
  ) {
    this.pieChartOptions = {
      series: [],
      chart: {
        type: 'donut',
        width: 200,
      },
      labels: [],
      colors: [],
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      responsive: [],
    };
    this.getBalanceInformationAdmin();
  }

  ngOnInit() {
    this.initChartReport();
    this.loadLocations();
    this.user = this.authService.currentUserAdminValue;
    this.getLastRegisteredUsers();
    this.loadPurchasesChart();
    this.loadAffiliatesChart();
  }

  showError(message: string) {
    this.toastr.error(message);
  }

  loadLocations() {
    this.affiliateService.getTotalAffiliatesByCountries().subscribe({
      next: (value) => {
        this.maps = value.data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching locations:', err);
      },
    })
  }

  private initChartReport3() {
    this.pieChartOptions = {
      series: [
        Number(this.adminCommissions),
        Number(this.walletProfit),
        Number(this.commissionsPaid),
        Number(this.calculatedCommissions),
        Number(this.totalMembers),
        Number(this.totalReverseBalance),
      ],
      colors: [
        '#bfd34cff',
        '#f44336',
        '#2196f3',
        '#96a2b4',
        '#4caf50',
        '#9c27b0',
      ],
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
        'Comisiones para el admin',
        'Beneficio en billetera',
        'Total comisiones pagadas',
        'Total recycoins vendidos',
        'Afiliados activos',
        'Saldo balance 2',
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

  private initChartReport() {
    this.avgLecChartOptions = {
      series: [
        {
          name: 'Directos',
          data: [0.5, 0, 1, 0.5, 1, 0, 0, 1, 0.2, 0.4, 1, 0],
        },
      ],
      chart: {
        height: 350,
        type: 'line',
        dropShadow: {
          enabled: true,
          color: '#000',
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2,
        },
        toolbar: {
          show: false,
        },
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        categories: [
          'Ene',
          'Feb',
          'Mar',
          'Abr',
          'May',
          'Jun',
          'Jul',
          'Ago',
          'Sep',
          'Oct',
          'Nov',
          'Dic',
        ],
        title: {
          text: '',
        },
      },
      yaxis: {
        title: {
          text: '',
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          gradientToColors: ['#35fdd8'],
          shadeIntensity: 1,
          type: 'horizontal',
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100, 100, 100],
        },
      },
      markers: {
        size: 4,
        colors: ['#FFA41B'],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: {
          size: 7,
        },
      },
      tooltip: {
        theme: 'dark',
        marker: {
          show: true,
        },
        x: {
          show: true,
        },
      },
    };
  }

  getBalanceInformationAdmin() {
    this.walletService.getBalanceInformationAdmin().subscribe({
      next: value => {
        this.adminCommissions = value.data.totalCommissionsEarned;
        this.totalMembers = value.data.enabledAffiliates;
        this.calculatedCommissions = value.data.calculatedCommissions;
        this.commissionsPaid = value.data.commissionsPaid;
        this.walletProfit = value.data.walletProfit;
        this.totalReverseBalance = value.data.totalReverseBalance;
        this.cdr.markForCheck();
        this.initChartReport3();
      },
      error: err => {
        console.log(err);
      },
    });
  }


  loadPurchasesChart() {
    this.invoiceService.getMonthlyPurchasesSummary().subscribe({
      next: (summary: MonthlyPurchases[]) => {
        this.purchases_chart = buildPurchasesChart(
          summary.map(item => `${MONTH_LABELS[item.month - 1]} ${String(item.year).slice(-2)}`),
          summary.map(item => Number(item.totalAmount)),
        );
      },
      error: () => {
        this.showError('Error al cargar las compras realizadas');
      },
    });
  }

  loadAffiliatesChart() {
    this.affiliateService.getMonthlyRegistrationsSummary().subscribe({
      next: (summary: MonthlyRegistrations[]) => {
        this.affiliates_chart = buildAffiliatesChart(
          summary.map(
            item =>
              `${MONTH_LABELS[item.month - 1]} ${String(item.year).slice(-2)}`,
          ),
          summary.map(item => Number(item.total)),
        );
      },
      error: () => {
        this.showError('Error al cargar los afiliados ingresados');
      },
    });
  }

  getLastRegisteredUsers() {
    this.affiliateService.getLastRegisteredAffiliates().subscribe({
      next: value => {
        this.lastRegisteredUsers = value.data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.showError('Error');
      },
    });
  }
}
