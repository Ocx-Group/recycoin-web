import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductRequest, RequestPayment } from '../../../core/models/coinpay-model/request-payment.model';
import { UserAffiliate } from '../../../core/models/user-affiliate-model/user.affiliate.model';
import { CoinpayService } from '../../../core/service/coinpay-service/coinpay.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import * as QRCode from 'qrcode';
import { Subscription, switchMap, timer } from 'rxjs';

import { ReactiveFormsModule } from '@angular/forms';
import { QrcodeModule } from 'qrcode-angular';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-coinpay-modal',
    templateUrl: './coinpay-modal.component.html',
    styleUrls: ['./coinpay-modal.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, QrcodeModule, TranslatePipe]
})
export class CoinpayModalComponent implements OnInit {
  paymentGroup: FormGroup;
  @Input() user: UserAffiliate;
  @Input() products: any[];
  @Input() total: number;
  selectedCrypto: 'BTC' | 'USDT' = null;
  selectedNetwork: {
    id: number;
    idChain: number;
    name: string;
    shortName: string;
    minimunTransferAmount: number;
    fee: number;
  } = null;
  qrCodeDataUrl: string;
  walletAddress: string;
  transactionId: string;
  isLoading: boolean = false;
  private pollingSubscription: Subscription;
  private pollingInterval = 5000;
  networks: any[] = [];
  private modalReference: NgbModalRef;
  @ViewChild('coinpayPaymentModal') coinpayPaymentModal: TemplateRef<any>;
  private readonly iconMap = {
    'BTC': 'assets/images/crypto/bitcoin.png',
    'USDT': 'assets/images/crypto/thether.png',
    'ERC20': 'assets/images/crypto/erc20.png',
    'BEP20': 'assets/images/crypto/bep20.png',
    'PoS': 'assets/images/crypto/polygon.png',
    'TRC20': 'assets/images/crypto/trc20.png',
    'Solana': 'assets/images/crypto/solana.png'
  };

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private coinpayService: CoinpayService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.initControls();
  }

  showSuccess(message: string) {
    this.toastr.success(message);
  }

  showError(message: string) {
    this.toastr.error(message);
  }

  trackByNetwork(index: number, network: any): number {
    return network.id;
  }

  getNetworkIcon(shortName: string): string {
    return this.iconMap[shortName] || 'assets/images/crypto/default.png';
  }

  initControls() {
    this.paymentGroup = this.formBuilder.group({
      network: ['', Validators.required],
      amount: ['', Validators.required]
    })
  }

  getNetworksById(id: number) {
    this.coinpayService.getNetworks(id).subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.networks = response;
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  backToNetworkSelection() {
    this.selectedNetwork = null;
    this.resetPaymentDetails();
    this.stopTransactionStatusPolling();
  }

  resetPaymentDetails() {
    this.walletAddress = '';
    this.transactionId = '';
    this.qrCodeDataUrl = '';
  }

  openCoinpayModal() {
    this.selectedNetwork = null;
    this.modalReference = this.modalService.open(this.coinpayPaymentModal, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      centered: true,
    });
  }

  selectCrypto(crypto: 'BTC' | 'USDT') {
    this.selectedCrypto = crypto;
    this.selectedNetwork = null;
    this.resetPaymentDetails();

    if (crypto === 'USDT') {
      this.getNetworksById(19);
    } else {
      this.getNetworksById(1);
    }
  }

  backToCryptoSelection() {
    this.selectedCrypto = null;
    this.selectedNetwork = null;
    this.resetPaymentDetails();
    this.stopTransactionStatusPolling();
  }

  selectNetwork(network: any) {
    this.selectedNetwork = { ...network };
    this.paymentGroup.get('network').setValue(network.idChain);
    this.resetPaymentDetails();
    this.createCoinPayTransaction(network.idChain);
  }

  constructProductDetails(): ProductRequest[] {
    return this.products.map(product => {
      return {
        productId: product.id,
        quantity: product.quantity
      };
    });
  }

  createCoinPayTransaction(networkId: number) {
    this.isLoading = true;

    const request = this.createTransactionRequest(networkId);

    this.coinpayService.createChannel(request).subscribe({
      next: async (response) => {
        if (response.success) {
          const transactionData = response.data.data;
          this.walletAddress = transactionData.address;
          this.transactionId = transactionData.idExternalIdentification.toString();

          console.log(response);

          try {
            this.qrCodeDataUrl = await QRCode.toDataURL(this.walletAddress);
            this.isLoading = false;

            this.cdr.detectChanges();

            this.startTransactionStatusPolling(this.transactionId);
          } catch (error) {
            console.error('Error generating QR code:', error);
            this.isLoading = false;
            this.showError("Error al generar el código QR");
          }
        } else {
          this.isLoading = false;
          this.showError("Error al crear la transacción");
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.showError("Error al crear la transacción");
      },
    });
  }

  createTransactionRequest(networkId: number): RequestPayment {
    const request = new RequestPayment();
    request.affiliateId = this.user.id;
    request.userName = this.user.user_name;
    request.amount = this.total;
    request.products = this.constructProductDetails();
    request.networkId = this.selectedCrypto === 'BTC' ? 1 : networkId;
    request.currencyId = this.selectedCrypto === 'BTC' ? 1 : 19;
    return request;
  }

  startTransactionStatusPolling(reference: string) {

    this.pollingSubscription = timer(0, this.pollingInterval).pipe(
      switchMap(() => this.coinpayService.getTransactionByReference(reference))
    ).subscribe({
      next: (response) => {
        if (response.data === true) {
          this.showSuccess('Pago confirmado');
          this.stopTransactionStatusPolling();
          this.cleanAndCloseModal();
        }
      },
      error: (error) => {
        console.error('Error al obtener el estado de la transacción:', error);
        this.showError('Error al verificar el estado del pago');
        this.stopTransactionStatusPolling();
      }
    });
  }

  stopTransactionStatusPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  cleanAndCloseModal() {
    if (this.modalReference) {
      this.modalReference.close();
      this.modalReference = null;
    }
  }
}
