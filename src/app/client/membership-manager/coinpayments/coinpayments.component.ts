import { interval, switchMap, takeWhile } from 'rxjs';
import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { CreatePayment, ProductRequest } from '../../../core/models/coinpayment-model/create-payment.model';
import { Product } from '../../../core/models/product-model/product.model';
import { UserAffiliate } from '../../../core/models/user-affiliate-model/user.affiliate.model';
import { AuthService } from '../../../core/service/authentication-service/auth.service';
import { CoinpaymentService } from '../../../core/service/coinpayment-service/coinpayment.service';
import { TransactionInfo } from '../../../core/models/coinpayment-model/transaction-info.model'
import { ConpaymentTransaction } from '../../../core/models/coinpayment-model/conpayment-transaction.model';
import { MembershipManagerService } from '../../../core/service/membership-manager-service/membership-manager.service';
import { CommonModule } from '@angular/common';
import {NgbAlert} from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: 'app-coinpayments',
    templateUrl: './coinpayments.component.html',
    styleUrls: ['./coinpayments.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgbAlert]
})
export class CoinpaymentsComponent {
  // Ambos los escribe la respuesta de createTransaction, que llega despues del
  // primer pintado. El fichero no llevaba marca de estrategia y en Angular 22 eso
  // ya es OnPush, asi que hasta ahora el QR y la direccion no llegaban a pintarse.
  readonly qrImageUrl = signal<string>('');
  readonly address = signal<string>('');
  txn_Id: string;
  isLoading = false;
  public user: UserAffiliate = new UserAffiliate();
  @Input() membership: Product;
  @Output() loadingChange = new EventEmitter<boolean>();

  constructor(
    private coinPaymentService: CoinpaymentService,
    private auth: AuthService,
    private toast: ToastrService,
    private router: Router,
    private membershipManagerService: MembershipManagerService) { }

  ngOnInit(): void {
    this.user = this.auth.currentUserAffiliateValue;
  }

  ngAfterViewInit(): void {
    this.createCoinPaymentTransaction();
  }

  createCoinPaymentTransaction() {
    this.loadingChange.emit(true);
    this.coinPaymentService.createTransaction(this.buildCoinPaymentRequest()).subscribe({
      next: (value: ConpaymentTransaction) => {
        this.qrImageUrl.set(value.qrcode_Url);
        this.address.set(value.address);
        this.txn_Id = value.txn_Id;
        this.getTransactionInfo(this.txn_Id, true);
      },
      error: () => {
      },
    });
  }

  buildCoinPaymentRequest() {
    const request = new CreatePayment();
    const productRequest = this.transformProductToRequest(this.membership);

    request.amount = 10;
    request.buyer_email = this.user.email;
    request.buyer_name = this.user.name + ' ' + this.user.last_name;
    request.item_number = this.user.id.toString();
    request.ipn_url = 'https://wallet.recycoinfx.net/api/v1/ConPayments/coinPaymentsIPN';
    request.currency1 = 'USDT.TRC20';
    request.currency2 = 'USDT.TRC20';
    request.item_name = this.user.user_name;

    request.products.push(productRequest);
    return request;
  }

  transformProductToRequest(product: any): ProductRequest {
    return {
      productId: product.id,
      quantity: 1
    };
  }

  getTransactionInfo(idTransaction: string, fullInfo: boolean) {
    interval(60000)
      .pipe(
        switchMap(() => this.coinPaymentService.getTransactionInfo(idTransaction, fullInfo)),
        takeWhile((value: TransactionInfo) => value.status !== 1)
      )
      .subscribe({
        next: (value: TransactionInfo) => {
          if (value.status === 1) {
            this.showSuccess('La membresía se activó correctamente');
            this.close();
            this.router.navigateByUrl('/app/home', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/app/home']);
            });
          }
        },
        error: () => {
        },
      })
  }

  showSuccess(message) {
    this.toast.success(message);
  }

  close() {
    this.membershipManagerService.close();
  }
}
