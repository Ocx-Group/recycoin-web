import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { ProductsRequests, WalletRequest } from '@app/core/models/wallet-model/wallet-request.model';
import { AuthService } from '@app/core/service/authentication-service/auth.service';
import { CartService } from '@app/core/service/cart.service/cart.service';
import { WalletService } from '@app/core/service/wallet-service/wallet.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';


@Component({
    selector: 'app-conpayment-confirmation',
    templateUrl: './conpayment-confirmation.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: []
})
export class ConpaymentConfirmationComponent implements OnInit {
  walletRequest: WalletRequest = new WalletRequest();
  user: UserAffiliate = new UserAffiliate();
  public products: any = [];

  constructor(private cartService: CartService, private walletService: WalletService, private router: Router, private toastr: ToastrService, private authService: AuthService) {

  }

  ngOnInit(): void {
    this.user = this.authService.currentUserAffiliateValue;
    this.paymentConfirmation();
  }

  showError(message) {
    this.toastr.error(message);
  }

  paymentConfirmation() {
    Swal.fire({
      title: 'Su pago se ha realizado correctamente.',
      showCancelButton: false,
      confirmButtonColor: '#8963ff',
      confirmButtonText: 'Ok',
    }).then((result) => {
      this.processPayment();
      this.router.navigateByUrl('/app/home');
    });
  }

  private processPayment() {

    this.cartService.getProducts().subscribe(products => {
      this.walletRequest.affiliateId = this.user.id;
      this.walletRequest.affiliateUserName = this.user.user_name;
      this.walletRequest.paymentMethod = 3;
      this.walletRequest.purchaseFor = 0;

      products.forEach(item => {
        const productRequest = new ProductsRequests();
        productRequest.idProduct = item.id;
        productRequest.count = item.quantity;
        this.walletRequest.productsList.push(productRequest);
      });

      // this.walletService.payWithMyBalance(this.walletRequest).subscribe({
      //   next: (value) => {
      //     if (value.success == true) {
      //       this.paymentConfirmation();
      //       this.router.navigate(['app/home']);
      //       this.cartService.removeAllCart();
      //     } else {
      //       this.showError('Error: No se pudo realizar el pago.');
      //     }
      //   },
      //   error: (err) => {
      //     this.showError('Error: No se pudo realizar el pago.');
      //   },
      // });
    });
  }


}
