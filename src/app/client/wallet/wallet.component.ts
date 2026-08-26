import {
  Component,
  HostListener,
  OnInit,
  ViewChild,
  TemplateRef,
  AfterViewInit,
  ChangeDetectionStrategy,
  signal
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

import { BalanceInformation } from '@app/core/models/wallet-model/balance-information.model';
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { WalletService } from '@app/core/service/wallet-service/wallet.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AuthService } from '@app/core/service/authentication-service/auth.service';


import { TruncateDecimalsPipe } from '@app/shared/pipes/truncate-decimals.pipe';
import { IconsModule } from '@app/shared';
import { RouterLink } from '@angular/router';
import {
  ReusableDatatableComponent,
  TableColumn,
  TableConfig,
  TableAction,
} from '@app/shared/components/reusable-datatable/reusable-datatable.component';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgxDatatableModule,
    TranslatePipe,
    TruncateDecimalsPipe,
    IconsModule,
    RouterLink,
    ReusableDatatableComponent
],
})
export class WalletComponent implements OnInit, AfterViewInit {
  balanceInformation: BalanceInformation = new BalanceInformation();
  public userCookie: UserAffiliate;
  readonly rows = signal<any[]>([]);
  temp = [];
  readonly loadingIndicator = signal<boolean>(true);
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;

  // Templates personalizados
  @ViewChild('creditTemplate', { static: false })
  creditTemplate: TemplateRef<any>;
  @ViewChild('debitTemplate', { static: false })
  debitTemplate: TemplateRef<any>;
  @ViewChild('statusTemplate', { static: false })
  statusTemplate: TemplateRef<any>;

  // Configuración para el componente reutilizable
  tableColumns: TableColumn[] = [];
  tableActions: TableAction[] = [];
  tableConfig: TableConfig = {
    showSearch: true, // Mostrar slot de búsqueda personalizada
    showActions: true, // Mostrar slot de botones personalizados
    searchPlaceholder: 'WALLET-PAGE.SEARCH.TEXT',
    headerHeight: 50,
    footerHeight: 50,
    rowHeight: 'auto',
    limit: 10,
    columnMode: 'force',
    reorderable: true,
    swapColumns: true,
    // messages se heredará del defaultConfig del componente reutilizable
  };

  constructor(
    private readonly walletService: WalletService,
    private readonly authService: AuthService,
    private readonly toastr: ToastrService,
    private readonly translateService: TranslateService,
  ) {
    this.initializeTableColumns();
    this.initializeTableActions();
  }

  ngOnInit(): void {
    // Usar signal para obtener el usuario afiliado
    this.userCookie = this.authService.userAffiliate();
    if (this.userCookie) {
      this.loadBalanceInformation();
    }
    this.loadWalletList();
  }

  ngAfterViewInit(): void {
    // Actualizar las columnas con los templates personalizados
    setTimeout(() => {
      this.updateColumnsWithTemplates();
    });
  }

  showError(message: string) {
    this.toastr.error(message, 'Error!');
  }

  @HostListener('window:resize')
  onResize() {
    this.scrollBarHorizontal = window.innerWidth < 1200;
  }

  loadWalletList() {
    this.walletService.getWalletByAffiliateId(this.userCookie.id).subscribe({
      next: resp => {
        if (resp != null && resp.length > 0) {
          this.temp = [...resp];
          this.rows.set(resp);
        }
        this.loadingIndicator.set(false);
      },
      error: err => {
        this.showError('Error!');
        console.error(err);
      },
    });
  }

  loadBalanceInformation() {
    this.walletService
      .getBalanceInformationByAffiliateId(this.userCookie.id)
      .subscribe({
        next: resp => {
          this.balanceInformation.availableBalance = resp.availableBalance;
          this.balanceInformation.reverseBalance = resp.reverseBalance;
          this.balanceInformation.totalCommissionsPaid =
            resp.totalCommissionsPaid;
          this.balanceInformation.bonusAmount = resp.bonusAmount;
        },
        error: err => {
          this.showError('Error!');
          console.error(err);
        },
      });
  }

  getRowHeight(row: any) {
    return row.height;
  }

  updateFilter(event: any) {
    const val = this.normalizeText(event.target.value);

    if (val === '') {
      this.rows.set([...this.temp]);
    } else {
      this.rows.set(this.temp.filter(d => {
        return (
          this.normalizeText(d.concept).includes(val) ||
          this.normalizeText(d.adminUserName || '').includes(val) ||
          this.normalizeText(d.affiliateUserName || '').includes(val)
        );
      }));
    }
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  downloadPDF() {
    const DATA = document.getElementById('htmlTable');
    const today = new Date();

    html2canvas(DATA).then(canvas => {
      let pdf = new jsPDF('l', 'mm', 'a4');

      const pageWidth = 297;
      const imgWidth = pageWidth - 40;

      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const posX = 20;
      const posY = 30;

      pdf.setFontSize(18);
      pdf.text('Movimientos de mi billetera', pageWidth / 2, 20, {
        align: 'center',
      });

      const contentDataURL = canvas.toDataURL('image/png');
      pdf.addImage(contentDataURL, 'PNG', posX, posY, imgWidth, imgHeight);

      const formattedDate = today
        .toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
        .replace(/[/:]/g, '-')
        .replace(', ', '_');

      pdf.save(`movimientos_billetera_${formattedDate}.pdf`);
    });
  }

  copyTableData() {
    if (this.rows?.length) {
      const headers = [
        this.translateService.instant('WALLET-PAGE.USER-COLUMN.TEXT'),
        this.translateService.instant('WALLET-PAGE.AFFILIATE-COLUMN.TEXT'),
        this.translateService.instant('WALLET-PAGE.CREDIT-COLUMN.TEXT'),
        this.translateService.instant('WALLET-PAGE.DEBIT-COLUMN.TEXT'),
        this.translateService.instant('WALLET-PAGE.STATE-COLUMN.TEXT'),
        this.translateService.instant('WALLET-PAGE.CONCEPT-COLUMN.TEXT'),
        this.translateService.instant('WALLET-PAGE.DATE-COLUMN.TEXT'),
        this.translateService.instant('WALLET-PAGE.DETAILS-COLUMN.TEXT'),
      ];

      const data = this.rows().map(row => [
        row.adminUserName,
        row.affiliateUserName,
        row.credit,
        row.debit,
        row.status ? 'Atendido' : 'No atendido',
        row.concept,
        row.date,
        '...',
      ]);

      const tableText = [headers, ...data]
        .map(row => row.join('\t'))
        .join('\n');
      this.copyTextToClipboard(tableText);
    }
  }

  copyTextToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      this.toastr.success('Se ha copiado al portapapeles');
    } catch (err) {
      console.error('Error: ', err);
    }

    textArea.remove();
  }

  showDetail(detail: string) {
    Swal.fire({
      title: this.translateService.instant('WALLET-PAGE.DETAILS-COLUMN.TEXT'),
      text: detail,
      icon: 'info',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6',
      showCancelButton: false,
      allowOutsideClick: false,
      backdrop: true,
      customClass: {
        popup: 'swal-popup',
        container: 'swal-container',
      },
    }).then(result => {
      if (result.isConfirmed) {
        /* empty */
      }
    });
  }

  initializeTableColumns() {
    this.tableColumns = [
      {
        name: this.translateService.instant('WALLET-PAGE.USER-COLUMN.TEXT'),
        prop: 'adminUserName',
        sortable: true,
      },
      {
        name: this.translateService.instant(
          'WALLET-PAGE.AFFILIATE-COLUMN.TEXT',
        ),
        prop: 'affiliateUserName',
        sortable: true,
      },
      {
        name: this.translateService.instant('WALLET-PAGE.CREDIT-COLUMN.TEXT'),
        prop: 'credit',
        sortable: true,
      },
      {
        name: this.translateService.instant('WALLET-PAGE.DEBIT-COLUMN.TEXT'),
        prop: 'debit',
        sortable: true,
      },
      {
        name: this.translateService.instant('WALLET-PAGE.STATE-COLUMN.TEXT'),
        prop: 'status',
        sortable: true,
      },
      {
        name: this.translateService.instant('WALLET-PAGE.CONCEPT-COLUMN.TEXT'),
        prop: 'concept',
        sortable: true,
      },
      {
        name: this.translateService.instant('WALLET-PAGE.DATE-COLUMN.TEXT'),
        prop: 'date',
        sortable: true,
      },
    ];
  }

  initializeTableActions() {
    this.tableActions = [
      {
        label: this.translateService.instant('WALLET-PAGE.VIEW-DETAILS.TEXT'),
        icon: 'bi bi-folder2-open',
        callback: (row: any) => this.showDetail(row.detail),
        condition: (row: any) =>
          row.detail !== null && row.detail !== undefined && row.detail !== '',
      },
    ];
  }

  updateColumnsWithTemplates() {
    // Asignar templates personalizados a las columnas correspondientes
    const creditColumn = this.tableColumns.find(col => col.prop === 'credit');
    if (creditColumn && this.creditTemplate) {
      creditColumn.cellTemplate = this.creditTemplate;
    }

    const debitColumn = this.tableColumns.find(col => col.prop === 'debit');
    if (debitColumn && this.debitTemplate) {
      debitColumn.cellTemplate = this.debitTemplate;
    }

    const statusColumn = this.tableColumns.find(col => col.prop === 'status');
    if (statusColumn && this.statusTemplate) {
      statusColumn.cellTemplate = this.statusTemplate;
    }

    // Forzar la detección de cambios
    this.tableColumns = [...this.tableColumns];
  }
}
