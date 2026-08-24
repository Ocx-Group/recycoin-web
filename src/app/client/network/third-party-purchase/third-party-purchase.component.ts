import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import QRCode from 'qrcode';
import { Subscription, switchMap, timer } from 'rxjs';

import { RequestPayment } from '@app/core/models/coinpay-model/request-payment.model';
import { Product } from '@app/core/models/product-model/product.model';
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { WalletRequest } from '@app/core/models/wallet-model/wallet-request.model';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { QrcodeModule } from 'qrcode-angular';
import { CoinpayService } from '@app/core/service/coinpay-service/coinpay.service';
import { WalletService } from '@app/core/service/wallet-service/wallet.service';
import { AuthService } from '@app/core/service/authentication-service/auth.service';
import { MatrixConfigurationService } from '@app/core/service/matrix-configuration/matrix-configuration.service';
import { MatrixRequest } from '@app/core/interfaces/matrix-request';
import Swal from 'sweetalert2';
import { MatrixQualificationService } from '@app/core/service/matrix-qualification-service/matrix-qualification.service';
import { NgxSpinnerService } from 'ngx-spinner';
import {TranslatePipe} from "@ngx-translate/core";

@Component({
    selector: 'app-third-party-purchase',
    templateUrl: './third-party-purchase.component.html',
    styleUrls: ['./third-party-purchase.component.scss'],
    standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, QrcodeModule, TranslatePipe, NgOptimizedImage]
})
export class ThirdPartyPurchaseComponent implements OnInit, OnDestroy {
  @ViewChild('thirdPartyPurchaseModal')
  thirdPartyPurchaseModal: TemplateRef<any>;
  @Input() recycoins: Product[];
  @Output() purchaseAction = new EventEmitter<any>();
  matrixConfigurations: any[] = [];
  @Input() isReachedWithdrawalLimit: boolean = false;
  protected userReceivingPurchase: UserAffiliate;
  public currentUser: UserAffiliate;

  private modalReference: NgbModalRef;
  private pollingSubscription: Subscription;
  private readonly POLLING_INTERVAL = 5000;

  currentStep = 1;
  selectedFlow: 'purchase' | 'matrix' | null = null;
  chosenMatrixLevel: number | null = null;
  chosenMatrixConfig: any = null;
  selectedItems: Product[] = [];
  qrCodeData: string = '';
  paymentAddress: string = '';
  coinpayTransactionId: string = '';
  paymentMethod: 'coinpay' | 'wallet' | undefined = undefined;
  walletBalance: number = 0;

  constructor(
    private modalService: NgbModal,
    private coinpayService: CoinpayService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private walletService: WalletService,
    private authService: AuthService,
    private matrixConfigurationService: MatrixConfigurationService,
    private matrixQualificationService: MatrixQualificationService,
    private spinnerService: NgxSpinnerService,
    private toastrService: ToastrService,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserAffiliateValue;
    this.getAllMatrixConfigurations();
  }

  ngOnDestroy(): void {
    this.stopTransactionStatusPolling();
  }

  successMessage(message: string) {
    this.toastrService.success(message, 'Éxito', {
      timeOut: 3000,
      progressBar: true,
      progressAnimation: 'increasing',
      closeButton: true,
    });
  }

  errorMessage(message: string) {
    this.toastrService.error(message, 'Error', {
      timeOut: 3000,
      progressBar: true,
      progressAnimation: 'increasing',
      closeButton: true,
    });
  }

  openModal(user: UserAffiliate): void {
    this.userReceivingPurchase = user;
    this.resetModalState();
    this.getWalletBalance();
    this.modalReference = this.modalService.open(this.thirdPartyPurchaseModal, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      centered: true,
    });
  }

  toggleSelection(recycoin: Product): void {
    const index = this.selectedItems.findIndex(item => item.id === recycoin.id);
    if (index > -1) this.selectedItems.splice(index, 1);
    else this.selectedItems.push(recycoin);
  }

  nextStep(): void {
    if (this.currentStep < 4) {
      this.currentStep++;
      if (this.currentStep === 4 && this.selectedFlow === 'purchase') {
        this.processPayment();
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  getStepTitle(): string {
    const titles = [
      'THIRD_PARTY_PURCHASE.SELECT_FLOW',
      this.selectedFlow === 'purchase'
        ? 'THIRD_PARTY_PURCHASE.SELECT_RECYCOINS'
        : 'THIRD_PARTY_PURCHASE.SELECT_MATRIX',
      this.selectedFlow === 'purchase'
        ? 'THIRD_PARTY_PURCHASE.SELECT_PAYMENT_METHOD'
        : 'THIRD_PARTY_PURCHASE.CONFIRM_MATRIX_ACTIVATION',
      this.selectedFlow === 'purchase'
        ? this.paymentMethod === 'coinpay'
          ? 'THIRD_PARTY_PURCHASE.SCAN_QR'
          : 'THIRD_PARTY_PURCHASE.WALLET_PAYMENT'
        : 'THIRD_PARTY_PURCHASE.CONFIRM_MATRIX_ACTIVATION',
    ];
    return titles[this.currentStep - 1] || '';
  }

  copyToClipboard(text: string): void {
    navigator.clipboard
      .writeText(text)
      .then(() => this.showSuccess('Texto copiado al portapeles'))
      .catch(err => console.error('Error al copiar texto: ', err));
  }

  private resetModalState(): void {
    this.currentStep = 1;
    this.selectedFlow = null;
    this.chosenMatrixLevel = null;
    this.selectedItems = [];
    this.qrCodeData = '';
    this.coinpayTransactionId = '';
    this.paymentMethod = undefined;
  }

  private getWalletBalance(): void {
    this.walletService
      .getBalanceInformationByAffiliateId(this.currentUser.id)
      .subscribe({
        next: balance => (this.walletBalance = balance.availableBalance),
        error: err => {
          console.error('Error fetching wallet balance:', err);
          this.showError('Error al obtener el saldo de la billetera');
        },
      });
  }

  private processPayment(): void {
    if (this.paymentMethod === 'coinpay') {
      this.createCoinPayTransaction();
    }
  }

  private createCoinPayTransaction(): void {
    const request: RequestPayment = this.prepareCoinPayRequest();
    this.coinpayService.createChannel(request).subscribe({
      next: this.handleCoinPayResponse.bind(this),
      error: this.handlePaymentError.bind(this),
    });
  }

  protected processWalletPayment(): void {
    const request = this.prepareWalletRequest();
    if (this.walletBalance >= this.getTotalAmount()) {
      this.walletService.payWithMyBalanceForOthers(request).subscribe({
        next: response => {
          console.log(response);
          if (response.success) {
            this.showSuccess('Pago realizado con éxito');
            this.cleanAndCloseModal();
          } else {
            console.error(response);
          }
        },
        error: this.handlePaymentError.bind(this),
      });
    } else {
      this.showError('Saldo insuficiente en la billetera');
    }
  }

  private prepareCoinPayRequest(): RequestPayment {
    return {
      affiliateId: this.userReceivingPurchase.id,
      userName: this.userReceivingPurchase.user_name,
      amount: this.getTotalAmount(),
      products: this.selectedItems.map(product => ({
        productId: product.id,
        quantity: 1,
      })),
      networkId: 56,
      currencyId: 19,
    };
  }

  private prepareWalletRequest(): WalletRequest {
    const request = new WalletRequest();
    request.affiliateId = this.currentUser.id;
    request.affiliateUserName = this.currentUser.user_name;
    request.purchaseFor = this.userReceivingPurchase.id;
    request.productsList = this.selectedItems.map(product => ({
      idProduct: product.id,
      count: 1,
    }));
    return request;
  }

  private handleCoinPayResponse(response: any): void {
    if (response.success && response.data && response.data.data) {
      this.paymentAddress = response.data.data.address;
      this.coinpayTransactionId = response.data.data.id.toString();
      this.generateQRCode(this.paymentAddress);
      this.startTransactionStatusPolling(this.coinpayTransactionId);
    } else {
      console.error('Invalid response structure:', response);
      this.showError(
        'Error al crear la transacción: dirección de pago no disponible',
      );
    }
  }

  private handlePaymentError(error: any): void {
    console.error('Payment processing error:', error);
    this.showError('Error al procesar el pago');
  }

  private generateQRCode(address: string): void {
    QRCode.toDataURL(address)
      .then(url => {
        this.zone.run(() => {
          this.qrCodeData = url;
          this.cdr.detectChanges();
        });
      })
      .catch(err =>
        this.showError('Error al generar el código QR: ' + err.message),
      );
  }

  private startTransactionStatusPolling(reference: string): void {
    this.pollingSubscription = timer(0, this.POLLING_INTERVAL)
      .pipe(
        switchMap(() =>
          this.coinpayService.getTransactionByReference(reference),
        ),
      )
      .subscribe({
        next: response => {
          if (response.data === true) {
            this.showSuccess('Pago confirmado');
            this.stopTransactionStatusPolling();
            this.cleanAndCloseModal();
          }
        },
        error: error => {
          console.error('Error al obtener el estado de la transacción:', error);
          this.showError('Error al verificar el estado del pago');
          this.stopTransactionStatusPolling();
        },
      });
  }

  private stopTransactionStatusPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  private cleanAndCloseModal(): void {
    if (this.modalReference) {
      this.modalReference.close();
      this.modalReference = null;
    }
  }

  private showSuccess(message: string): void {
    this.toastr.success(message);
  }

  private showError(message: string): void {
    this.toastr.error(message);
  }

  isSelected(recycoin: Product): boolean {
    return this.selectedItems.some(item => item.id === recycoin.id);
  }

  getTotalAmount(): number {
    return this.selectedItems.reduce(
      (total, item) => total + item.baseAmount,
      0,
    );
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.selectedFlow !== null;
      case 2:
        return this.selectedFlow === 'purchase'
          ? this.selectedItems.length > 0
          : this.chosenMatrixConfig !== null;
      case 3:
        return this.selectedFlow === 'purchase'
          ? this.paymentMethod !== undefined
          : true;
      default:
        return true;
    }
  }

  // --- Flujo inicial: elegir compra o matrices ---
  selectFlow(flow: 'purchase' | 'matrix'): void {
    this.selectedFlow = flow;
    this.nextStep();
  }

  // Selección de nivel de matriz
  selectMatrixLevel(level: number): void {
    this.chosenMatrixLevel = level;
  }

  selectMatrixConfig(config: any): void {
    this.chosenMatrixConfig = config;
  }

  activateMatrixWithBalance(): void {
    const user = this.authService.currentUserAffiliateValue;
    if (!user || !this.chosenMatrixConfig || !this.userReceivingPurchase) {
      this.errorMessage('Datos insuficientes para activar la matriz.');
      return;
    }

    const request: MatrixRequest = {
      userId: user.id,
      matrixType: this.chosenMatrixConfig.matrixType,
      recipientId: this.userReceivingPurchase.id,
    };

    Swal.fire({
      title: 'Activar matriz',
      text: '¿Está seguro de activar la matriz con saldo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then(result => {
      if (!result.isConfirmed) return;

      this.spinnerService.show().then();
      this.matrixQualificationService
        .processDirectPaymentMatrixActivation(request)
        .subscribe({
          next: response => {
            this.spinnerService.hide().then();
            if (response) {
              this.successMessage('Matriz activada con éxito.');
              this.cleanAndCloseModal();
            } else {
              this.errorMessage('Error al activar la matriz.');
            }
          },
          error: error => {
            this.spinnerService.hide().then();
            console.error('Error en la activación:', error);
            this.errorMessage('Error en la activación de la matriz.');
          },
        });
    });
  }

  getAllMatrixConfigurations() {
    this.matrixConfigurationService.getAllMatrixConfigurations().subscribe({
      next: config => {
        this.matrixConfigurations = config;
      },
      error: err => {
        console.error('Error', err);
      },
    });
  }
}
