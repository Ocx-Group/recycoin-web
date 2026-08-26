import { WalletRequestRevertTransaction } from '@app/core/models/wallet-request-request-model/wallet-request-revert-transaction.model';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  TemplateRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import Swal from 'sweetalert2';

import { InvoiceService } from '@app/core/service/invoice-service/invoice.service';
import { ToastrService } from 'ngx-toastr';
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { AuthService } from '@app/core/service/authentication-service/auth.service';
import { Invoice } from '@app/core/models/invoice-model/invoice.model';
import { PrintService } from '@app/core/service/print-service/print.service';
import { WalletRequestService } from '@app/core/service/wallet-request/wallet-request.service';
import { ConfigurationService } from '@app/core/service/configuration-service/configuration.service';
import { WalletWithdrawalsConfiguration } from '@app/core/models/wallet-withdrawals-configuration-model/wallet-withdrawals-configuration.model';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

import { BillingPurchasesDetailModalComponent } from '@app/client/billing-purchases/billing-purchases-detail-modal/billing-purchases-detail-modal.component';
import { IconsModule } from '@app/shared';
import { RouterLink } from '@angular/router';
import {
  ReusableDatatableComponent,
  TableColumn,
  TableAction,
  TableConfig,
} from '@app/shared/components/reusable-datatable/reusable-datatable.component';

@Component({
  selector: 'app-filter',
  templateUrl: './billing-purchases.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    BillingPurchasesDetailModalComponent,
    IconsModule,
    RouterLink,
    ReusableDatatableComponent
],
})
export class BillingPurchasesComponent implements OnInit, AfterViewInit {
  private user: UserAffiliate = new UserAffiliate();
  private walletRequestRevertTransaction: WalletRequestRevertTransaction =
    new WalletRequestRevertTransaction();
  withdrawalConfiguration = new WalletWithdrawalsConfiguration();
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;

  @ViewChild('modalChildDetail')
  modalChildDetail: BillingPurchasesDetailModalComponent;
  @ViewChild('customButtons') customButtons: TemplateRef<any>;
  @ViewChild('noBillTemplate') noBillTemplate: TemplateRef<any>;
  @ViewChild('billStateTemplate') billStateTemplate: TemplateRef<any>;
  @ViewChild('paidStateTemplate') paidStateTemplate: TemplateRef<any>;
  @ViewChild('modelTemplate') modelTemplate: TemplateRef<any>;
  @ViewChild('totalAmountTemplate') totalAmountTemplate: TemplateRef<any>;

  // Configuración para tabla reutilizable
  tableColumns: TableColumn[] = [];
  tableActions: TableAction[] = [];
  tableConfig: TableConfig = {
    showSearch: true,
    showActions: true,
    searchPlaceholder: 'BILLING-PURCHASES-PAGE.SEARCH.TEXT',
    headerHeight: 50,
    footerHeight: 50,
    rowHeight: 'auto',
    limit: 10,
    columnMode: 'force',
    reorderable: true,
  };

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly toastr: ToastrService,
    private readonly auth: AuthService,
    private readonly printService: PrintService,
    private readonly walletRequestService: WalletRequestService,
    private readonly configurationService: ConfigurationService,
    private readonly translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Usar signal para obtener el usuario afiliado
    this.user = this.auth.userAffiliate();

    this.setupTableActions();
    this.loadBillingPurchases();
    this.loadWithdrawalConfiguration();
  }

  ngAfterViewInit(): void {
    this.setupTableColumns();
  }

  setupTableColumns(): void {
    this.tableColumns = [
      {
        name: this.translateService.instant(
          'BILLING-PURCHASES-PAGE.ROW-NO-BILL.TEXT',
        ),
        prop: 'id',
        sortable: true,
        cellTemplate: this.noBillTemplate,
      },
      {
        name: this.translateService.instant(
          'BILLING-PURCHASES-PAGE.ROW-DATE.TEXT',
        ),
        prop: 'date',
        sortable: true,
      },
      {
        name: this.translateService.instant(
          'BILLING-PURCHASES-PAGE.ROW-BILL-STATE.TEXT',
        ),
        prop: 'status',
        sortable: true,
        cellTemplate: this.billStateTemplate,
      },
      {
        name: this.translateService.instant(
          'BILLING-PURCHASES-PAGE.ROW-PAID.TEXT',
        ),
        prop: 'state',
        sortable: true,
        cellTemplate: this.paidStateTemplate,
      },
      {
        name: this.translateService.instant(
          'BILLING-PURCHASES-PAGE.ROW-MODEL.TEXT',
        ),
        prop: 'invoicesDetails',
        sortable: false,
        cellTemplate: this.modelTemplate,
      },
      {
        name: this.translateService.instant(
          'BILLING-PURCHASES-PAGE.TOTAL-AMOUNT.TEXT',
        ),
        prop: 'totalInvoice',
        sortable: true,
        cellTemplate: this.totalAmountTemplate,
      },
    ];
  }

  setupTableActions(): void {
    this.tableActions = [
      {
        label: this.translateService.instant(
          'BILLING-PURCHASES-PAGE.BTN-SEE-DETAILS.TEXT',
        ),
        icon: 'bi bi-person-badge',
        callback: row => {
          if (this.modalChildDetail) {
            this.modalChildDetail.billingPurchasesOpenModal(
              this.modalChildDetail['billingPurchasesDetailModal'],
              row,
            );
          }
        },
      },
    ];
  }

  showSuccess(message: string) {
    this.toastr.success(message);
  }

  showError(message: string) {
    this.toastr.error(message);
  }

  loadWithdrawalConfiguration() {
    this.configurationService.getWithdrawalsWalletConfiguration().subscribe({
      next: value => {
        this.withdrawalConfiguration.activate_invoice_cancellation =
          value.activate_invoice_cancellation;
      },
      error: err => {
        this.showError('Error');
      },
    });
  }

  loadBillingPurchases() {
    this.invoiceService.getAllInvoicesUser(this.user.id).subscribe({
      next: (invoices: Invoice[]) => {
        this.temp = [...invoices];
        this.rows = invoices;
        this.loadingIndicator = false;
        this.cdr.markForCheck();
        console.log(this.rows);
      },
      error: err => {
        this.showError('Error');
      },
    });
  }

  getRowHeight(row) {
    return row.height;
  }

  onPrintInvoice(invoice: Invoice) {
    this.invoiceService.createInvoice(invoice.id).subscribe({
      next: (blob: Blob) => {
        const blobUrl = globalThis.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `invoice_${invoice.id}.pdf`;

        document.body.appendChild(a);
        a.click();

        globalThis.URL.revokeObjectURL(blobUrl);
        a.remove();
      },
      error: err => {
        console.log(err);
        this.showError('Error downloading the invoice. Please try again.');
      },
    });
  }

  showConfirmationRequest(row) {
    let reason;

    this.askForReason()
      .then(result => {
        if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.close();
          return;
        }

        if (!result.value) {
          this.askForReason();
          return;
        }

        reason = result.value;
        return this.confirmRequest(result.value, row);
      })
      .then(result => {
        if (result?.isConfirmed) {
          this.setRequestRevertTransaction(row, reason);
          this.createRequestRevertDebitTransaction();
        }
      })
      .catch(error => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message,
        }).then();
      });
  }

  askForReason() {
    return Swal.fire({
      title: 'Ingrese un motivo para anular la factura',
      input: 'text',
      inputPlaceholder: 'motivo',
      showCancelButton: true,
      confirmButtonText: 'Solicitar',
      cancelButtonText: 'Cancelar',
    });
  }

  confirmRequest(reason, row) {
    return Swal.fire({
      title: '¿Está seguro que desea realizar la solicitud?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
    });
  }

  setRequestRevertTransaction(row, reason): WalletRequestRevertTransaction {
    this.walletRequestRevertTransaction.affiliateId = row.affiliateId;
    this.walletRequestRevertTransaction.concept = reason;
    this.walletRequestRevertTransaction.invoiceId = row.id;

    return this.walletRequestRevertTransaction;
  }

  createRequestRevertDebitTransaction() {
    this.walletRequestService
      .createWalletRequestRevertDebitTransaction(
        this.walletRequestRevertTransaction,
      )
      .subscribe({
        next: value => {
          this.showSuccess('La solicitud fue creada correctamente');
        },
        error: err => {
          this.showError('Error');
        },
      });
  }

  downloadPDF() {
    const DATA = document.getElementById('htmlTable');

    html2canvas(DATA).then(canvas => {
      let pdf = new jsPDF('l', 'mm', 'a4');

      const pageWidth = 297;
      const imgWidth = pageWidth - 40;

      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const posX = 20;
      const posY = 30;

      pdf.setFontSize(18);
      pdf.text('Lista de compras', pageWidth / 2, 20, { align: 'center' });

      const contentDataURL = canvas.toDataURL('image/png');
      pdf.addImage(contentDataURL, 'PNG', posX, posY, imgWidth, imgHeight);
      pdf.save('documento.pdf');
    });
  }

  copyTableData() {
    const headers = [
      this.translateService.instant('BILLING-PURCHASES-PAGE.ROW-NO-BILL.TEXT'),
      this.translateService.instant('BILLING-PURCHASES-PAGE.ROW-DATE.TEXT'),
      this.translateService.instant(
        'BILLING-PURCHASES-PAGE.ROW-BILL-STATE.TEXT',
      ),
      this.translateService.instant('BILLING-PURCHASES-PAGE.ROW-PAID.TEXT'),
      this.translateService.instant('BILLING-PURCHASES-PAGE.ROW-DETAIL.TEXT'),
    ];

    const data = this.rows.map(row => [
      row.id,
      row.date,
      row.status ? 'Activa' : 'Cancelada',
      row.state ? 'Pagado' : 'No pagado',
      '...',
    ]);

    const tableText = [headers, ...data].map(row => row.join('\t')).join('\n');
    this.copyTextToClipboard(tableText);
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

    document.body.removeChild(textArea);
  }
}
