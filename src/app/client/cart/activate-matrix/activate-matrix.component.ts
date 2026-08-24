import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { PaymentDetails, PaymentTranslations } from './activate-matrix-interfaces';
import { ConpaymentTransaction } from '@app/core/models/coinpayment-model/conpayment-transaction.model';
import { CreatePayment } from '@app/core/models/coinpayment-model/create-payment.model';
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { AuthService } from '@app/core/service/authentication-service/auth.service';
import { CoinpaymentService } from '@app/core/service/coinpayment-service/coinpayment.service';
import { MatrixConfigurationService } from '@app/core/service/matrix-configuration/matrix-configuration.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-activate-matrix',
    templateUrl: './activate-matrix.component.html',
    styleUrls: ['./activate-matrix.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonModule, FormsModule, TranslatePipe]
})
export class ActivateMatrixComponent implements OnInit {
  matrixConfigurations: any[] = [];
  currentUser: UserAffiliate;
  selectedMatrixConfig: any = null;
  loading = false;
  today = new Date();
  products: any = [];
  transaction: ConpaymentTransaction = new ConpaymentTransaction();

  constructor(
    private matrixConfigurationService: MatrixConfigurationService,
    private authService: AuthService,
    private toastrService: ToastrService,
    private conpaymentService: CoinpaymentService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserAffiliateValue;
    this.getAllMatrixConfigurations();
  }

  getAllMatrixConfigurations(): void {
    this.loading = true;
    this.matrixConfigurationService.getAllMatrixConfigurations().subscribe({
      next: config => {
        console.log('Matrix configurations:', config);
        this.matrixConfigurations = config;
        this.loading = false;
      },
      error: err => {
        console.error('Error loading matrix configurations:', err);
        this.errorMessage('Error al cargar las configuraciones de matriz');
        this.loading = false;
      },
    });
  }

  selectMatrixConfig(config: any): void {
    this.selectedMatrixConfig = config;
  }

  successMessage(message: string): void {
    this.toastrService.success(message, 'Éxito', {
      timeOut: 3000,
      progressBar: true,
      progressAnimation: 'increasing',
      closeButton: true,
    });
  }

  errorMessage(message: string): void {
    this.toastrService.error(message, 'Error', {
      timeOut: 3000,
      progressBar: true,
      progressAnimation: 'increasing',
      closeButton: true,
    });
  }

  createTransactionRequest(): CreatePayment {
    if (!this.selectedMatrixConfig) {
      throw new Error('No hay matriz seleccionada');
    }

    const request = new CreatePayment();

    request.amount = this.selectedMatrixConfig.feeAmount;
    request.buyer_email = this.currentUser.email;
    request.buyer_name = `${this.currentUser.name} ${this.currentUser.last_name}`;
    request.item_number = this.currentUser.id.toString();
    request.ipn_url = 'https://wallet.recycoin.net/api/v1/MatrixQualification/coinpayments_matrix_activation_confirmation';
    request.currency1 = 'USDT.BEP20';
    request.currency2 = 'USDT.BEP20';
    request.item_name = `${this.selectedMatrixConfig.matrixName} - ${this.selectedMatrixConfig.matrixType}`;

    request.products = [
      {
        productId: parseInt(this.selectedMatrixConfig.matrixType) || 1,
        quantity: 1,
      },
    ];

    return request;
  }

  showCoinPaymentConfirmation(): void {
    if (!this.validatePaymentPreConditions()) {
      return;
    }

    const paymentDetails = this.calculatePaymentDetails();
    const translations = this.getPaymentTranslations();

    this.showPaymentDialog(paymentDetails, translations)
      .then(result => {
        if (result.isConfirmed) {
          this.processPayment();
        }
      })
      .catch(error => {
        this.handlePaymentError(error, 'Error en confirmación:');
      });
  }

  private validatePaymentPreConditions(): boolean {
    if (!this.selectedMatrixConfig) {
      this.errorMessage('Por favor selecciona una matriz para activar');
      return false;
    }

    if (!this.currentUser?.email) {
      this.errorMessage('Error: No se encontraron los datos del usuario');
      return false;
    }

    return true;
  }

  private calculatePaymentDetails(): PaymentDetails {
    const matrixCost = this.selectedMatrixConfig.feeAmount;
    const gatewayFee = (matrixCost * 0.01).toFixed(2);
    const totalAmount = (matrixCost + parseFloat(gatewayFee)).toFixed(2);

    return {
      matrixName: this.selectedMatrixConfig.matrixName,
      matrixType: this.selectedMatrixConfig.matrixType,
      matrixCost,
      gatewayFee,
      totalAmount,
    };
  }

  private getPaymentTranslations(): PaymentTranslations {
    return {
      activateMatrix: this.translateService.instant('ACTIVATE_MATRIX.TITLE'),
      matrixType: this.translateService.instant('ACTIVATE_MATRIX.MATRIX_TYPE'),
      totalCost: this.translateService.instant('ACTIVATE_MATRIX.TOTAL_COST'),
      gatewayFee: this.translateService.instant('ACTIVATE_MATRIX.GATEWAY_FEE') || 'Fee de pasarela',
      matrixCost: this.translateService.instant('ACTIVATE_MATRIX.MATRIX_COST') || 'Costo de matriz',
      totalToPay: this.translateService.instant('ACTIVATE_MATRIX.TOTAL_TO_PAY') || 'Total a pagar',
      paymentWarning: this.translateService.instant('ACTIVATE_MATRIX.PAYMENT_WARNING') || 'En caso de que no se confirme la totalidad de los fondos, su compra será revertida automáticamente.',
      gatewayFeeInfo: this.translateService.instant('ACTIVATE_MATRIX.GATEWAY_FEE_INFO') || 'La pasarela de pago cobra un fee del 1% sobre el monto de la compra.',
      confirmPayment: this.translateService.instant('ACTIVATE_MATRIX.CONFIRM_PAYMENT') || 'Sí, pagar',
      cancel: this.translateService.instant('ACTIVATE_MATRIX.CANCEL') || 'Cancelar',
    };
  }

  private showPaymentDialog(paymentDetails: PaymentDetails, translations: PaymentTranslations): Promise<any> {
    return Swal.fire({
      title: `¿${translations.activateMatrix} ${paymentDetails.matrixName}?`,
      html: this.buildPaymentDialogHtml(paymentDetails, translations),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `${translations.confirmPayment} ${paymentDetails.totalAmount}`,
      cancelButtonText: translations.cancel,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
    });
  }

  private buildPaymentDialogHtml(paymentDetails: PaymentDetails, translations: PaymentTranslations): string {
    return `
    ${this.buildPaymentSummaryHtml(paymentDetails, translations)}
    ${this.buildWarningAlertHtml(translations.paymentWarning)}
    ${this.buildInfoAlertHtml(translations.gatewayFeeInfo)}
  `;
  }

  private buildPaymentSummaryHtml(paymentDetails: PaymentDetails, translations: PaymentTranslations): string {
    return `
    <div style="text-align: left; margin: 20px 0;">
      <p><strong>Matriz:</strong> ${paymentDetails.matrixName}</p>
      <p><strong>${translations.matrixCost}:</strong> ${paymentDetails.matrixCost}</p>
      <p><strong>${translations.gatewayFee} (1%):</strong> ${paymentDetails.gatewayFee}</p>
      <hr style="margin: 10px 0; border: 1px solid #ddd;">
      <p><strong>${translations.totalToPay}:</strong> ${paymentDetails.totalAmount}</p>
    </div>
  `;
  }

  private buildWarningAlertHtml(message: string): string {
    return `
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 10px; margin: 15px 0;">
      <small style="color: #856404;">
        <i class="fas fa-exclamation-triangle"></i>
        ${message}
      </small>
    </div>
  `;
  }

  private buildInfoAlertHtml(message: string): string {
    return `
    <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 5px; padding: 10px; margin: 15px 0;">
      <small style="color: #0c5460;">
        <i class="fas fa-info-circle"></i>
        ${message}
      </small>
    </div>
  `;
  }

  private processPayment(): void {
    this.loading = true;

    try {
      const transactionRequest = this.createTransactionRequest();
      this.executePaymentTransaction(transactionRequest);
    } catch (error) {
      this.handlePaymentError(error, 'Error preparando transacción:');
    }
  }

  private executePaymentTransaction(transactionRequest: CreatePayment): void {
    this.conpaymentService.createTransaction(transactionRequest).subscribe({
      next: (response: ConpaymentTransaction) => this.handlePaymentSuccess(response),
      error: error => this.handlePaymentError(error, 'Error creando transacción:'),
    });
  }

  private handlePaymentSuccess(response: ConpaymentTransaction): void {
    this.transaction = response;
    this.loading = false;

    if (response?.checkout_Url) {
      this.successMessage(`Redirigiendo al pago de la matriz ${this.selectedMatrixConfig.matrixName}`);
      this.redirectToPayment(response.checkout_Url);
    } else {
      this.errorMessage('Error: No se recibió la URL de pago');
    }
  }

  private redirectToPayment(url: string): void {
    setTimeout(() => {
      window.open(url, '_blank');
    }, 1000);
  }

  private handlePaymentError(error: any, logMessage: string): void {
    this.loading = false;
    console.error(logMessage, error);
    this.errorMessage(logMessage === 'Error creando transacción:' ? 'Error al crear la transacción de pago' : 'Error al preparar la transacción');
  }
}
