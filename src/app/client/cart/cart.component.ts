import {MatrixQualificationService} from '@app/core/service/matrix-qualification-service/matrix-qualification.service';
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {NavigationStart, Router} from '@angular/router';
import {CreateChannelResponse} from '@app/core/models/coinpay-model/create-channel-response.model';
import {
  CreatePagaditoTransactionRequest
} from '@app/core/models/pagadito-model/create-pagadito-transaction-request.model';
import {ToastrService} from 'ngx-toastr';
import QRCode from 'qrcode';
import {CartService} from '@app/core/service/cart.service/cart.service';
import Swal from 'sweetalert2';

import {CreateTransactionResponse} from '@app/core/models/coinpay-model/create-transaction-response.model';
import {RequestPayment} from '@app/core/models/coinpay-model/request-payment.model';
import {ConpaymentTransaction} from '@app/core/models/coinpayment-model/conpayment-transaction.model';
import {
  CreatePayment,
  ProductRequest,
} from '@app/core/models/coinpayment-model/create-payment.model';
import {UserAffiliate} from '@app/core/models/user-affiliate-model/user.affiliate.model';
import {
  ProductsRequests,
  WalletRequest,
} from '@app/core/models/wallet-model/wallet-request.model';
import {
  WalletWithdrawalsConfiguration
} from '@app/core/models/wallet-withdrawals-configuration-model/wallet-withdrawals-configuration.model';
import {AuthService} from '@app/core/service/authentication-service/auth.service';
import {CoinpayService} from '@app/core/service/coinpay-service/coinpay.service';
import {CoinpaymentService} from '@app/core/service/coinpayment-service/coinpayment.service';
import {ConfigurationService} from '@app/core/service/configuration-service/configuration.service';
import {WalletService} from '@app/core/service/wallet-service/wallet.service';

import {
  PagaditoTransactionDetailRequest
} from '@app/core/models/pagadito-model/pagadito-transaction-detail-request.model';
import {AffiliateService} from '@app/core/service/affiliate-service/affiliate.service';
import {PagaditoService} from '@app/core/service/pagadito-service/pagadito.service';
import {PdfViewerService} from '@app/core/service/pdf-viewer-service/pdf-viewer.service';
import {WalletModel1AService} from '@app/core/service/wallet-model-1a-service/wallet-model-1a.service';
import {WalletModel1BService} from '@app/core/service/wallet-model-1b-service/wallet-model-1b.service';
import {Subscription, switchMap, timer} from 'rxjs';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {QrcodeModule} from 'qrcode-angular';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {TranslateModule} from '@ngx-translate/core';
import {CoinpayModalComponent} from "@app/client/cart/coinpay-modal/coinpay-modal.component";
import {PdfViewerComponent} from "@app/shared/components/pdf-viewer/pdf-viewer.component";
import {TruncateDecimalsPipe} from "@app/shared/pipes/truncate-decimals.pipe";

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    FormsModule,
    QrcodeModule,
    NgbModule,
    TranslateModule,
    CoinpayModalComponent, PdfViewerComponent,
    TruncateDecimalsPipe]
})
export class CartComponent implements OnInit, OnDestroy {
  today: Date;
  subTotal: number;
  total: number;
  totalTax: number = 0;
  totalDiscount: number = 0;
  products: any = [];
  user: UserAffiliate = new UserAffiliate();
  userReceivesPurchase: UserAffiliate = new UserAffiliate();
  walletRequest: WalletRequest = new WalletRequest();
  showReversePaymentOnly: boolean = false;
  transaction: ConpaymentTransaction = new ConpaymentTransaction();
  coinPayTransactionResponse = new CreateTransactionResponse();
  withdrawalConfiguration = new WalletWithdrawalsConfiguration();
  balancePaymentNotAvailable: boolean = false;
  reverseBalanceNotAvailable: boolean = false;
  excludedPaymentGroups = [2, 3, 7, 8, 9, 10];
  reverseBalanceExcludedPaymentGroups = [2, 7, 8];
  serviceBalanceExcludedPaymentGroups = [7, 8];
  serviceBalanceNotAvailable: boolean = false;
  model: string = '';
  pagaditoRequest = new CreatePagaditoTransactionRequest();
  referenceTransaction: string = '';
  private pollingSubscription: Subscription;
  private pollingInterval = 5000;
  private routerSubscription: Subscription;
  private swalInstance: any;
  @ViewChild('coinpayPaymentModal') coinpayPaymentModal: TemplateRef<any>;
  isReachedWithdrawalLimit: boolean = false;

  constructor(
    private cartService: CartService,
    private router: Router,
    private auth: AuthService,
    private toastr: ToastrService,
    private conpaymentService: CoinpaymentService,
    private walletService: WalletService,
    private coinpayService: CoinpayService,
    private configurationService: ConfigurationService,
    private walletModel1AService: WalletModel1AService,
    private walletModel1BService: WalletModel1BService,
    private affiliateService: AffiliateService,
    private pagaditoService: PagaditoService,
    private pdfViewerService: PdfViewerService,
    private matrixQualificationService: MatrixQualificationService,
  ) {
  }

  ngOnInit(): void {
    this.user = this.auth.currentUserAffiliateValue;
    this.hasReachedWithdrawalLimit(this.user.id);
    this.today = new Date();
    this.today.getTime();
    this.cartService.getProducts().subscribe(res => {
      this.products = res;
      this.setValuesToPaid();
    });

    this.verificateUrl();
    this.checkExistenceOfAffiliateForReversePayment().then();
    this.loadWithdrawalConfiguration();
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.cleanupOnNavigation();
      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    this.cleanupOnNavigation();
  }

  cleanupOnNavigation() {
    if (this.swalInstance) {
      this.swalInstance.close();
    }
    this.stopTransactionStatusPolling();
    Swal.close();
  }

  ngOnDestroy() {
    this.cartService.clearPurchaseFromThirdParty();
    this.stopTransactionStatusPolling();
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  showSuccess(message: string) {
    this.toastr.success(message);
  }

  showError(message: string) {
    this.toastr.error(message);
  }

  verificateUrl() {
    if (this.products.length === 0) {
      this.router.navigate(['app/home']).then();
    }
  }

  removeItem(item: any) {
    this.cartService.removeCartItem(item);
    this.setValuesToPaid();
    if (this.cartService.getProducts.length === 0) {
      this.verificateUrl();
    }
  }

  emptycart() {
    this.cartService.removeAllCart();
    this.verificateUrl();
  }

  setValuesToPaid(): void {
    let totalTax = 0;
    let subTotal = 0;
    let grandTotal = 0;

    if (this.products.length > 0) {
      const firstProduct = this.products[0];
      switch (firstProduct.paymentGroup) {
        case 2:
          this.model = '2';
          break;
        case 7:
          this.model = '1A';
          break;
        case 8:
          this.model = '1B';
          break;
        case 11:
          this.model = 'recycoin';
          break;
        default:
          break;
      }
    }

    this.products.forEach(item => {
      if (!this.excludedPaymentGroups.includes(item.paymentGroup)) {
        this.balancePaymentNotAvailable = true;
      }

      if (
        this.reverseBalanceExcludedPaymentGroups.includes(item.paymentGroup)
      ) {
        this.reverseBalanceNotAvailable = true;
      }

      this.serviceBalanceNotAvailable = !this.products.some(item =>
        this.serviceBalanceExcludedPaymentGroups.includes(item.paymentGroup),
      );

      grandTotal += item.quantity * item.baseAmount;
      totalTax += parseFloat(item.tax.toFixed(0));
      subTotal += parseFloat(item.total.toFixed(2));
    });

    this.totalTax = totalTax;
    this.subTotal = subTotal;
    this.total = grandTotal;
  }

  async showBalanceConfirmation(): Promise<boolean> {
    try {
      let result = await Swal.fire({
        title:
          '¿Al realizar la compra estás aceptando los términos y condiciones, está seguro que desea realizar el pago?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, quiero realizar el pago',
        cancelButtonText: 'No',
        html: `Por favor, asegúrese de haber leído y aceptado los <a href="https://recycoinfx.com/wp-content/uploads/2024/01/recycoin-V3.pdf" target="_blank">términos y condiciones</a>.`,
        preConfirm: () => {
        },
      });
      if (result.isConfirmed) {
        this.acceptTerms();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error en showBalanceConfirmation:', error);
      return false;
    }
  }

  showCoinPaymentConfirmation() {
    Swal.fire({
      title: '¿Está seguro que desea realizar el pago?',
      text: 'En caso de que no se confirme la totalidad de los fondos, su compra será revertida automáticamente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
    })
      .then(result => {
        if (result.isConfirmed) {
          this.conpaymentService
            .createTransaction(this.createTransactionRequest())
            .subscribe((response: ConpaymentTransaction) => {
              this.transaction = response;

              if (response) {
                window.open(this.transaction.checkout_Url, '_blank');
                this.emptycart();
              }
            });
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  handleBalancePayment() {
    switch (this.model) {
      case '2':
        this.payWithMyBalanceModel2().then();
        break;
      case '1A':
        this.payWithMyBalanceModel1A().then();
        break;
      case '1B':
        this.payWithMyBalanceModel1B().then();
        break;
      default:
        break;
    }
  }

  handleServiceBalancePayment() {
    switch (this.model) {
      case '1A':
        this.payWithMyServiceBalanceModel1A().then();
        break;
      case '1B':
        this.payWithMyServiceBalanceModel1B().then();
        break;
      default:
        break;
    }
  }

  createBalanceRequest(): WalletRequest {
    this.walletRequest.affiliateId = this.user.id;
    this.walletRequest.affiliateUserName = this.user.user_name;
    this.walletRequest.paymentMethod = 1;

    this.products.forEach(item => {
      const productRequest = new ProductsRequests();
      productRequest.idProduct = item.id;
      productRequest.count = item.quantity;
      this.walletRequest.productsList.push(productRequest);
    });

    return this.walletRequest;
  }

  async payWithMyBalance() {
    const confirm = await this.showBalanceConfirmation();

    if (!confirm) return;

    this.walletService.payWithMyBalance(this.createBalanceRequest()).subscribe({
      next: value => {
        if (value.success) {
          this.showSuccess('Pago realizado correctamente');
          this.router.navigate(['app/home']);
          this.emptycart();
        } else {
          this.showError('Error: No se pudo realizar el pago.');
        }
      },
      error: () => {
        this.showError('Error: No se pudo realizar el pago.');
      },
    });
  }

  async payWithMyBalanceModel2() {
    const confirm = await this.showBalanceConfirmation();

    if (!confirm) return;

    this.walletService
      .payWithMyBalanceModel2(this.createBalanceRequest())
      .subscribe({
        next: value => {
          if (value.success) {
            this.showSuccess('Pago realizado correctamente');
            this.router.navigate(['app/home']);
            this.emptycart();
          } else {
            this.showError('Error: No se pudo realizar el pago.');
          }
        },
        error: () => {
          this.showError('Error: No se pudo realizar el pago.');
        },
      });
  }

  checkExistenceOfAffiliateForReversePayment(): Promise<boolean> {
    return new Promise(resolve => {
      this.cartService.getPurchaseFromThirdParty().subscribe(user => {
        this.userReceivesPurchase = user;
        if (this.userReceivesPurchase && this.userReceivesPurchase.id) {
          this.showReversePaymentOnly = true;
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  createTransactionRequest(): CreatePayment {
    const request = new CreatePayment();

    request.amount = this.total;
    request.buyer_email = this.user.email;
    request.buyer_name = `${this.user.name} ${this.user.last_name}`;
    request.item_number = this.user.id.toString();
    request.ipn_url =
      'https://wallet.recycoin.net/api/v1/ConPayments/coinPaymentsIPN';
    request.currency1 = 'USDT.TRC20';
    request.currency2 = 'USDT.TRC20';
    request.item_name = this.user.user_name;

    request.products = this.products.map(item => ({
      productId: item.id,
      quantity: item.quantity,
    }));

    return request;
  }

  async showCoinpayAlert(coinPayTransaction: CreateChannelResponse) {
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, coinPayTransaction.data.address);
    this.referenceTransaction =
      coinPayTransaction.data.idExternalIdentification.toString();

    this.swalInstance = Swal.fire({
      title:
        'Realiza tu pago, escanea el código QR o ingresa la dirección de billetera',
      html: `
        <div>
          <div>Dirección Billetera: <strong>${coinPayTransaction.data.address} </strong></div>
          <div>Id Transacción: <strong> ${coinPayTransaction.data.id} </strong> </div>
          <div>Monto: <strong> $${this.total} </strong> </div>
          <br>
        </div>
        <div id="loadingStatus" style="color: green;">Esperando confirmación...</div>
      `,
      imageUrl: qrCanvas.toDataURL(),
      imageWidth: 200,
      imageHeight: 200,
      imageAlt: 'Código QR',
      showConfirmButton: false,
      allowOutsideClick: false,
      willClose: () => {
        this.stopTransactionStatusPolling();
      },
    });

    this.startTransactionStatusPolling(this.referenceTransaction);
  }

  createCoinPayTransaction() {
    let request = new RequestPayment();
    request.affiliateId = this.user.id;
    request.userName = this.user.user_name;
    request.amount = this.total;
    request.products = this.constructProductDetails();

    this.coinpayService.createChannel(request).subscribe({
      next: response => {
        if (response.success) {
          this.showCoinpayAlert(response.data).then();
        } else {
          this.showError('Error');
        }
      },
      error: err => {
        console.error(err);
        this.showError('Error');
      },
    });
  }

  constructProductDetails(): ProductRequest[] {
    return this.products.map(product => {
      return {
        productId: product.id,
        quantity: product.quantity,
      };
    });
  }

  showCoinPayConfirmation() {
    Swal.fire({
      title: '¿Está seguro que desea realizar el pago?',
      text: 'En caso de que no se confirme la totalidad de los fondos, su compra será revertida automáticamente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
    })
      .then(result => {
        if (result.isConfirmed) {
          this.createCoinPayTransaction();
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
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

  async payWithMyBalanceModel1A() {
    const confirm = await this.showBalanceConfirmation();

    if (!confirm) return;

    this.walletModel1AService
      .payWithMyBalance(this.createBalanceRequest())
      .subscribe({
        next: value => {
          if (value.success) {
            this.showSuccess('Pago realizado correctamente');
            this.router.navigate(['app/home']);
            this.emptycart();
          } else {
            this.showError('Error: No se pudo realizar el pago.');
          }
        },
        error: () => {
          this.showError('Error: No se pudo realizar el pago.');
        },
      });
  }

  async payWithMyBalanceModel1B() {
    const confirm = await this.showBalanceConfirmation();

    if (!confirm) return;

    this.walletModel1BService
      .payWithMyBalance(this.createBalanceRequest())
      .subscribe({
        next: value => {
          if (value.success) {
            this.showSuccess('Pago realizado correctamente');
            this.router.navigate(['app/home']);
            this.emptycart();
          } else {
            this.showError('Error: No se pudo realizar el pago.');
          }
        },
        error: () => {
          this.showError('Error: No se pudo realizar el pago.');
        },
      });
  }

  handleBuyMore() {
    switch (this.model) {
      case '2':
        this.router.navigate(['app/billing-purchase']).then();
        break;
      case '1A':
        this.router.navigate(['app/savings-plans']).then();
        break;
      case '1B':
        this.router.navigate(['app/savings-plans-one-b']).then();
        break;
      case 'recycoin':
        this.router.navigate(['app/recycoin']).then();
        break;
      default:
        this.router.navigate(['app/educational-courses']).then();
        break;
    }
  }

  async payWithMyServiceBalanceModel1A() {
    const confirm = await this.showBalanceConfirmation();

    if (!confirm) return;

    this.walletModel1AService
      .payWithServiceBalance(this.createBalanceRequest())
      .subscribe({
        next: value => {
          if (value.success) {
            this.showSuccess('Pago realizado correctamente');
            this.router.navigate(['app/home']);
            this.emptycart();
          } else {
            this.showError('Error: No se pudo realizar el pago.');
          }
        },
        error: () => {
          this.showError('Error: No se pudo realizar el pago.');
        },
      });
  }

  async payWithMyServiceBalanceModel1B() {
    const confirm = await this.showBalanceConfirmation();

    if (!confirm) return;

    this.walletModel1BService
      .payWithMyServiceBalance(this.createBalanceRequest())
      .subscribe({
        next: value => {
          if (value.success) {
            this.showSuccess('Pago realizado correctamente');
            this.router.navigate(['app/home']);
            this.emptycart();
          } else {
            this.showError('Error: No se pudo realizar el pago.');
          }
        },
        error: () => {
          this.showError('Error: No se pudo realizar el pago.');
        },
      });
  }

  acceptTerms() {
    if (!this.user.termsConditions) {
      this.affiliateService.updateAffiliate(this.user).subscribe({
        next: () => {
          this.showSuccess('Términos y condiciones actualizados correctamente');
          this.auth.setUserAffiliateValue(this.user);
        },
        error: () => {
          this.showError('Error');
        },
      });
    }
  }

  createPagaditoTransaction() {
    let totalExclusiveOfTax = (this.total * 1.1).toFixed(2);
    this.pagaditoRequest.amount = parseFloat(totalExclusiveOfTax);
    this.pagaditoRequest.affiliate_id = this.user.id;

    this.products.forEach(item => {
      let detail = new PagaditoTransactionDetailRequest();
      detail.quantity = item.quantity;
      detail.description = item.name;
      let individualPriceExclusiveOfTax = (item.salePrice * 1.1).toFixed(2);
      detail.price = parseFloat(individualPriceExclusiveOfTax);
      detail.url_product = item.id.toString();

      this.pagaditoRequest.details.push(detail);
    });

    Swal.fire({
      title: 'Confirmación de pago',
      text: 'Se aplicará una comisión por uso de tarjeta. Una vez realizado el pago, la transacción no será reembolsable. ¿Desea continuar?',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, realizar pago',
    }).then(result => {
      if (result.isConfirmed) {
        this.pagaditoService.createTransaction(this.pagaditoRequest).subscribe({
          next: response => {
            if (response.success) {
              window.open(response.data);
              this.router.navigate(['app/home']).then();
              this.emptycart();
            }
          },
          error: err => {
            console.error(err);
          },
        });
      }
    });
  }

  startTransactionStatusPolling(reference: string) {
    this.stopTransactionStatusPolling();
    this.pollingSubscription = timer(0, this.pollingInterval)
      .pipe(
        switchMap(() =>
          this.coinpayService.getTransactionByReference(reference),
        ),
      )
      .subscribe({
        next: response => {
          if (response.data) {
            this.swalInstance.update({
              title: 'Pago confirmado',
              html: 'Tu pago ha sido procesado exitosamente.',
              icon: 'success',
              showConfirmButton: true,
            });
            this.stopTransactionStatusPolling();
            this.router.navigate(['app/home']).then();
            this.emptycart();
          }
        },
        error: error => {
          console.error('Error al obtener el estado de la transacción:', error);
          this.swalInstance.update({
            title: 'Error',
            html: 'Hubo un problema al procesar tu pago.',
            icon: 'error',
            showConfirmButton: true,
          });
          this.stopTransactionStatusPolling();
        },
      });
  }

  stopTransactionStatusPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
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
}
