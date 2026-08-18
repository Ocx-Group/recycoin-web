import { ThirdPartyPurchaseComponent } from './third-party-purchase/third-party-purchase.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Observable } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import html2canvas from 'html2canvas';
import JSPDF from 'jspdf';

import { NetworkAffiliate } from '@app/core/models/network-affiliate/network.affiliate.model';
import { AffiliateService } from '@app/core/service/affiliate-service/affiliate.service';
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { Grading } from '@app/core/models/grading-model/grading.model';
import { GradingService } from '@app/core/service/grading-service/grading.service';
import { AuthService } from '@app/core/service/authentication-service/auth.service';
import { WalletService } from '@app/core/service/wallet-service/wallet.service';
import { ToastrService } from 'ngx-toastr';
import { TransferBalance } from '@app/core/models/wallet-model/transfer-balance.model';
import { EncryptService } from '@app/core/service/encrypt-service/encrypt.service';
import { ConfigurationService } from '@app/core/service/configuration-service/configuration.service';
import { WalletWithdrawalsConfiguration } from '@app/core/models/wallet-withdrawals-configuration-model/wallet-withdrawals-configuration.model';
import { PagaditoTransactionDetailRequest } from '@app/core/models/pagadito-model/pagadito-transaction-detail-request.model';
import { CreatePagaditoTransactionRequest } from '@app/core/models/pagadito-model/create-pagadito-transaction-request.model';
import { PagaditoService } from '@app/core/service/pagadito-service/pagadito.service';
import { Product } from '@app/core/models/product-model/product.model';
import { ProductService } from '@app/core/service/product-service/product.service';
import { StatisticsInformation } from '@app/core/models/wallet-model/statisticsInformation';
import { MatrixQualificationService } from '@app/core/service/matrix-qualification-service/matrix-qualification.service';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IconsModule } from '@app/shared';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  standalone: true,
  imports: [
    CommonModule,
    NgxDatatableModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    NgbModule,
    IconsModule,
    RouterLink,
    ThirdPartyPurchaseComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NetworkComponent implements OnInit {
  isCollapsed = true;
  private user: UserAffiliate = new UserAffiliate();
  rows: NetworkAffiliate[] = [];
  gradings: Grading[] = [];
  transferBalance: TransferBalance = new TransferBalance();
  temp = [];
  userBalance: number;
  loadingIndicator = true;
  loadingIndicatorGlobal = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  rowsGlobal = [];
  tempGlobal = [];
  userName: string;
  withdrawalConfiguration = new WalletWithdrawalsConfiguration();
  isNewUser: boolean = false;
  pagaditoRequest = new CreatePagaditoTransactionRequest();
  currentMembership: Product = new Product();
  information: StatisticsInformation = new StatisticsInformation();
  @ViewChild('purchaseModal', { static: false })
  purchaseModal!: ThirdPartyPurchaseComponent;
  @ViewChild('tableRef') table: DatatableComponent;
  @ViewChild('tableRefGlobal') tableRefGlobal: DatatableComponent;
  recycoins$: Observable<Product[]>;
  isReachedWithdrawalLimit: boolean = false;

  constructor(
    private readonly affiliateService: AffiliateService,
    private readonly authService: AuthService,
    private readonly gradingService: GradingService,
    private readonly walletService: WalletService,
    private readonly toastr: ToastrService,
    private readonly encryptService: EncryptService,
    private readonly route: Router,
    private readonly translateService: TranslateService,
    private readonly configurationService: ConfigurationService,
    private readonly pagaditoService: PagaditoService,
    private readonly productService: ProductService,
    private readonly matrixQualificationService: MatrixQualificationService,
  ) {}

  ngOnInit() {
    this.loadingIndicatorGlobal = false;
    this.loadAllMemberships();

    // Usar signal para obtener el usuario afiliado
    this.user = this.authService.userAffiliate();
    if (this.user?.id) {
      this.affiliateService.changeId(this.user.id);

      this.gradingService.getAll().subscribe((gradings: Grading[]) => {
        this.gradings = gradings;
      });

      this.hasReachedWithdrawalLimit(this.user.id);

      this.affiliateService
        .GetPersonalNetwork(this.user.id)
        .subscribe((affiliates: NetworkAffiliate[]) => {
          this.temp = [...affiliates];
          this.rows = affiliates;
        });
    }
    this.loadingIndicator = false;

    this.loadBalanceAvailable();
    this.loadWithdrawalConfiguration();
    this.loadInformation();
    this.loadRecycoins();
  }

  showSuccess(message: string) {
    this.toastr.success(message);
  }

  showError(message: string) {
    this.toastr.error(message);
  }

  getNameGrading(id: number) {
    let grading = this.gradings.find(item => item.id === id);
    return grading ? grading.name : 'N/A';
  }

  loadBalanceAvailable() {
    this.walletService
      .getBalanceInformationByAffiliateId(this.user.id)
      .subscribe({
        next: value => {
          this.userBalance = value.availableBalance;
        },
        error: () => {
          this.showError('Error');
        },
      });
  }

  loadAllMemberships() {
    this.productService.getAllMembership().subscribe({
      next: resp => {
        this.currentMembership = resp[0];
      },
      error: () => {},
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    const target = event.target as Window;
    this.scrollBarHorizontal = target.innerWidth < 1200;

    if (this.table && this.tableRefGlobal) {
      this.table.recalculate();
      this.table.recalculateColumns();
    }
  }

  getRowHeight(row: any) {
    return row.height;
  }

  updateFilter(event: any) {
    const val = event.target.value.toLowerCase();

    this.rows = this.temp.filter(function (d) {
      return d.userName.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.table.offset = 0;
  }

  TransferBalanceForMembership(user) {
    this.transferBalance.fromAffiliateId = this.user.id;
    this.transferBalance.fromUserName = this.user.user_name;
    this.transferBalance.toUserName = user.userName || user.user_name;

    this.walletService
      .transferBalanceForMembership(this.transferBalance)
      .subscribe({
        next: value => {
          if (value) {
            this.showSuccess('Transferencia realizada correctamente');
          } else {
            this.showError('Error, verifique que tenga saldo.');
          }
        },
        error: () => {
          this.showError('Error');
        },
      });
  }

  showConfirmationTransferBalanceForMembership(row) {
    this.generateVerificationCode();
    Swal.fire({
      title:
        'Ingrese el código de verificación que ha sido enviado a su correo electrónico.',
      html: `<input id = "swal-input-code" type="text" placeholder="Código de verificación" class="swal2-input">`,
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const codeElement = Swal.getPopup().querySelector(
          '#swal-input-code',
        ) as HTMLInputElement;
        if (!codeElement) return;

        const code = codeElement.value.trim();
        if (!code) {
          Swal.showValidationMessage(
            'Por favor ingrese el código de verificación',
          );
        }

        this.transferBalance.securityCode = code;

        return code;
      },
    }).then(result => {
      if (result.isConfirmed) {
        this.TransferBalanceForMembership(row);
      }
    });
  }

  showConfirmationTransferBalance(row) {
    this.generateVerificationCode();

    let formattedBalance = Math.floor(this.userBalance * 100) / 100;

    Swal.fire({
      title:
        'Ingrese el código de verificación que ha sido enviado a su correo electrónico.',
      html: `
    <span style="font-size: 18px;">Transferencia para <span style="color: #ff5733;">${
      row.userName || row.user_name
    }</span></span><br>
    <span style="font-size: 18px;">Saldo Disponible <span style="color: #ff5733;">${formattedBalance}</span></span>
      <input id="swal-input-amount" type="number" placeholder="Monto" min="0" step="0.01" class="swal2-input">
      <input id="swal-input-code" type="text" placeholder="Código de verificación" class="swal2-input">
    `,
      showCancelButton: true,
      confirmButtonText: 'Transferir',
      cancelButtonText: 'Cancelar',
      preConfirm: this.swalPreConfirm.bind(this),
    })
      .then(result => {
        if (result.isConfirmed) {
          this.handleAmountEntry(result.value, row);
        }
      })
      .catch(error => console.error('Error:', error));
  }

  swalPreConfirm() {
    const amountElement = Swal.getPopup().querySelector(
      '#swal-input-amount',
    ) as HTMLInputElement;
    const codeElement = Swal.getPopup().querySelector(
      '#swal-input-code',
    ) as HTMLInputElement;

    if (!amountElement || !codeElement) return;

    const amount = parseFloat(amountElement.value);
    const code = codeElement.value;
    this.transferBalance.securityCode = code;

    if (isNaN(amount) || amount <= 0) {
      Swal.showValidationMessage('Por favor ingrese un monto válido');
    }
    if (!code.trim()) {
      Swal.showValidationMessage('Por favor ingrese el código de verificación');
    }
    if (amount > this.userBalance) {
      Swal.showValidationMessage(
        'El monto no puede ser mayor al saldo disponible',
      );
    }

    return amount;
  }

  handleAmountEntry(result, user) {
    if (result && result > 0) {
      const amount = Number(result);
      if (amount > this.userBalance) {
        this.showError('El monto ingresado supera el saldo disponible.');
      } else {
        this.showTransferConfirmation(amount, user);
      }
    } else if (!result.dismiss) {
      this.showError('Por favor ingrese un monto válido (mayor a 0).');
    }
  }

  showTransferConfirmation(amount, row) {
    Swal.fire({
      title: '¿Está seguro que desea transferir saldo?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
    })
      .then(result => {
        if (result.isConfirmed) {
          this.transferBalance.amount = amount;
          this.TransferBalance(row);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  TransferBalance(user) {
    this.transferBalance.fromAffiliateId = this.user.id;
    this.transferBalance.fromUserName = this.user.user_name;
    this.transferBalance.toUserName = user.userName;
    if (user.userName == undefined) {
      this.transferBalance.toUserName = user.user_name;
    }
    const result = this.encryptService.encryptObject(this.transferBalance);
    this.walletService.transferBalance(result).subscribe({
      next: value => {
        if (value.success) {
          this.showSuccess(value.message);
        } else {
          this.showError(value.message);
        }
      },
      error: () => {
        this.showError('Error');
      },
    });
  }

  setUserAffiliateByUserName(event: any) {
    this.userName = event.target.value;
  }

  getUserAffiliateByUserName() {
    this.rowsGlobal = [];
    this.affiliateService.getAffiliateByUserName(this.userName).subscribe({
      next: value => {
        if (value) {
          this.isNewUser = value.activation_date == null;
          this.rowsGlobal = [value];
          this.tempGlobal = value;
          this.loadingIndicatorGlobal = false;
        } else {
          this.rowsGlobal = [];
          this.showError('Usuario no existe');
        }
      },
      error: () => {
        this.showError('Error');
      },
    });
  }

  /*
    redirectToPurchases(row) {
      this.cartService.setPurchaseFromThirdParty(row);
      this.route.navigate(['app/billing-purchase']);
    }*/

  redirectToUnilevelTree() {
    this.route.navigate(['app/trees']).then();
  }

  downloadPDF() {
    const DATA = document.getElementById('htmlTable');

    html2canvas(DATA).then(canvas => {
      let pdf = new JSPDF('l', 'mm', 'a4');

      const pageWidth = 297;
      const imgWidth = pageWidth - 40;

      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const posX = 20;
      const posY = 30;

      pdf.setFontSize(18);
      pdf.text('Mi red', pageWidth / 2, 20, { align: 'center' });

      const contentDataURL = canvas.toDataURL('image/png');
      pdf.addImage(contentDataURL, 'PNG', posX, posY, imgWidth, imgHeight);
      pdf.save('documento.pdf');
    });
  }

  copyTableData() {
    // tableRefGlobal es la tabla de la red personal: tableRef es el buscador global,
    // que vive dentro de un *ngIf y no siempre esta renderizado.
    const rows = this.tableRefGlobal?._internalRows ?? [];
    if (rows.length) {
      // Las columnas deben seguir el mismo orden que la tabla de la red personal.
      const headers = [
        this.translateService.instant('NETWORK-PAGE.ROW-USER.TEXT'),
        this.translateService.instant('NETWORK-PAGE.ROW-LEVEL.TEXT'),
        this.translateService.instant('NETWORK-PAGE.ROW-FULL-NAME.TEXT'),
        this.translateService.instant('NETWORK-PAGE.ROW-PHONE.TEXT'),
        this.translateService.instant('NETWORK-PAGE.ROW-STATE.TEXT'),
        this.translateService.instant('NETWORK-PAGE.ROW-QUALIFICATION.TEXT'),
      ];

      const data = rows.map(row => [
        row.userName ?? '',
        row.level ?? '',
        row.fullName ?? '',
        row.phone ?? '',
        this.translateService.instant(
          row.activationDate != null
            ? 'NETWORK-PAGE.ACTIVE.TEXT'
            : 'NETWORK-PAGE.INACTIVE.TEXT'
        ),
        this.getNameGrading(row.externalGradingIdBefore),
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

    document.body.removeChild(textArea);
  }

  loadWithdrawalConfiguration() {
    this.configurationService.getWithdrawalsWalletConfiguration().subscribe({
      next: value => {
        this.withdrawalConfiguration.activate_invoice_cancellation =
          value.activate_invoice_cancellation;
      },
      error: () => {
        this.showError('Error');
      },
    });
  }

  generateVerificationCode() {
    this.affiliateService
      .generateVerificationCode(this.user.id, false)
      .subscribe({
        next: value => {
          if (value.success) {
            const toastConfig = {
              positionClass: 'toast-top-center',
            };

            this.toastr.success(
              'Se ha generado un código de seguridad, por favor revisa el correo electronico.',
              null,
              toastConfig,
            );
          }
        },
        error: () => {
          this.showError('Error');
        },
      });
  }

  createPagaditoTransaction(row: UserAffiliate) {
    this.pagaditoRequest.amount = this.currentMembership.salePrice * 1.1;
    this.pagaditoRequest.affiliate_id = row.id;

    let detail = new PagaditoTransactionDetailRequest();
    detail.quantity = 1;
    detail.description = this.currentMembership.description;

    detail.price = this.currentMembership.salePrice * 1.1;
    detail.url_product = this.currentMembership.id.toString();

    this.pagaditoRequest.details.push(detail);

    Swal.fire({
      title: 'Confirmación de pago',
      text: 'Se aplicará una comisión por uso de tarjeta. Una vez realizado el pago la transacción no será reembolsable. ¿Desea continuar?',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, realizar pago',
    }).then(result => {
      if (result.isConfirmed) {
        this.executePagaditoTransaction();
      }
    });
  }

  executePagaditoTransaction() {
    this.pagaditoService.createTransaction(this.pagaditoRequest).subscribe({
      next: response => {
        if (response.success) {
          window.open(response.data);
          this.showPostPaymentModal();
        }
      },
      error: err => {
        console.log(err);
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al procesar el pago. Por favor, intente nuevamente.',
          icon: 'error',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Cerrar',
        }).then();
      },
    });
  }

  showPostPaymentModal() {
    Swal.fire({
      title: 'Pago en Proceso',
      text: 'Una vez realizado el pago, el sistema activará automáticamente al usuario.',
      icon: 'info',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Entendido',
    }).then();
  }

  loadInformation() {
    this.walletService
      .getStatisticsInformationByAffiliateId(this.user.id)
      .subscribe({
        next: value => {
          this.information = value;
        },
        error: () => {
          this.showError('Error');
        },
      });
  }

  loadRecycoins() {
    this.recycoins$ = this.productService.getAllRecyCoin();
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
          }
        },
        error: err => {
          console.error(err);
        },
      });
  }

  openPurchaseModal(row: any): void {
    if (this.purchaseModal) {
      this.purchaseModal.openModal(row);
    } else {
      console.error('Purchase modal component is not initialized');
      this.showError('Error al abrir el modal de compra');
    }
  }
}
