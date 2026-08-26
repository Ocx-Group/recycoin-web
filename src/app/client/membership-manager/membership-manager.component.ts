import { MembershipManagerService } from '../../core/service/membership-manager-service/membership-manager.service';
import { BalanceInformation } from '../../core/models/wallet-model/balance-information.model';
import { WalletService } from '../../core/service/wallet-service/wallet.service';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import Swal from 'sweetalert2';

import { Product } from '../../core/models/product-model/product.model';
import { UserAffiliate } from '../../core/models/user-affiliate-model/user.affiliate.model';
import { AuthService } from '../../core/service/authentication-service/auth.service';
import { ProductService } from '../../core/service/product-service/product.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ProductsRequests, WalletRequest } from '../../core/models/wallet-model/wallet-request.model';
import { ToastrService } from 'ngx-toastr';
import { AffiliateService } from '../../core/service/affiliate-service/affiliate.service';
import { Router } from '@angular/router';
import { CreatePagaditoTransactionRequest } from '../../core/models/pagadito-model/create-pagadito-transaction-request.model';
import { PagaditoTransactionDetailRequest } from '../../core/models/pagadito-model/pagadito-transaction-detail-request.model';
import { PagaditoService } from '../../core/service/pagadito-service/pagadito.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoinpaymentsComponent } from './coinpayments/coinpayments.component';


@Component({
    selector: 'app-membership-manager',
    templateUrl: './membership-manager.component.html',
    styleUrls: ['./membership-manager-component.scss'],
    standalone: true,
    // El fichero no llevaba changeDetection y en Angular 22 eso ya es OnPush.
    // Se deja explicito para que las auditorias lo vean.
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, FormsModule, CoinpaymentsComponent]
})
export class MembershipManagerComponent implements OnInit, OnDestroy {
  payMethodSelected: number;
  memberships: Product[] = [];
  public user: UserAffiliate;
  currentMembership: Product = new Product();
  public isLoading: boolean = false;
  balanceInformation: BalanceInformation = new BalanceInformation();
  private suscription: Subscription;
  @ViewChild('membershipManagerModal', { static: true })
  membershipManagerModal!: TemplateRef<any>;
  private destroy$ = new Subject<void>();
  pagaditoRequest = new CreatePagaditoTransactionRequest();

  constructor(
    private modalService: NgbModal,
    private auth: AuthService,
    private productService: ProductService,
    private walletService: WalletService,
    private toastr: ToastrService,
    private affiliateService: AffiliateService,
    private router: Router,
    private membershipManagerService: MembershipManagerService,
    private pagaditoService: PagaditoService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.suscription = this.auth.currentUserAffiliate
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.user = user;
        this.cdr.markForCheck();
      });

    this.membershipManagerService.showModal$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.modalService.open(this.membershipManagerModal, { backdrop: 'static', keyboard: false, centered: true, size: 'sm', scrollable: true });
      });

    this.loadAllMemberships();
    this.loadBalanceInformation();
  }

  ngOnDestroy(): void {
    this.suscription.unsubscribe();
    this.close();
    this.destroy$.next();
    this.destroy$.complete();
  }

  showSuccess(message) {
    this.toastr.success(message);
  }

  showError(message) {
    this.toastr.error(message);
  }

  loadAllMemberships() {
    this.productService.getAllMembership().subscribe({
      next: (resp) => {
        this.memberships = resp;
        this.currentMembership = this.memberships[0];
        // La tarjeta de membresia (nombre, precio, descripcion) sale entera de
        // aqui: sin marcar, el modal se abre con el Product vacio.
        this.cdr.markForCheck();
      },
      error: (err) => { },
    });
  }

  close() {
    this.membershipManagerService.closeModal$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.modalService.dismissAll();
      });
  }

  paymentMethodSelected() {
    this.payMethodSelected;
  }

  changeMembership() {
    const currentIndex = this.memberships.indexOf(this.currentMembership);
    const nextIndex = (currentIndex + 1) % this.memberships.length;
    this.currentMembership = this.memberships[nextIndex];
  }

  loadBalanceInformation() {
    this.walletService.getBalanceInformationByAffiliateId(this.user.id).subscribe({
      next: (value) => {
        // Se muta la propiedad en vez de reasignar el objeto, asi que aqui no
        // sirve una senal: hay que marcar la vista.
        this.balanceInformation.availableBalance = value.availableBalance;
        this.cdr.markForCheck();
      },
      error: (err) => {

      },
    })
  }

  payWithBalance() {
    let walletRequest: WalletRequest = new WalletRequest();
    let productRequest: ProductsRequests = new ProductsRequests();
    productRequest.idProduct = this.currentMembership.id;
    productRequest.count = 1;

    walletRequest.purchaseFor = 0;
    walletRequest.affiliateId = this.user.id;
    walletRequest.affiliateUserName = this.user.user_name;
    walletRequest.bank = 'Saldo de billetera';
    walletRequest.paymentMethod = 3;
    walletRequest.productsList.push(productRequest);

    this.walletService.payMembershipWithMyBalance(walletRequest).subscribe({
      next: (value) => {
        this.showSuccess('Pago realizado correctamente')
        this.modalService.dismissAll();
        this.refreshUserInfoData(this.user.id);
        this.router.navigateByUrl('/app/home', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/app/home']);
        });
      },
      error: (err) => {
        this.showError('Error!')
      },
    })
  }

  confirmTransaction() {
    if (this.balanceInformation.availableBalance >= this.currentMembership.salePrice) {
      return Swal.fire({
        title: '¿Está seguro que desea realizar la solicitud?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
      }).then((result) => {
        if (result.isConfirmed) {
          this.payWithBalance();
        }
      });
    } else {
      this.toastr.error('No tienes suficiente balance para pagar la membresía.');
    }
  }

  refreshUserInfoData(id: number) {
    this.affiliateService.getAffiliateById(id).subscribe({
      next: (value) => {
        this.user = value.data;
        this.auth.setUserAffiliateValue(value.data);
        this.cdr.markForCheck();
      },
      error: (err) => {

      },
    })
  }

  createPagaditoTransaction() {
    this.pagaditoRequest.amount = this.currentMembership.salePrice * 1.10;
    this.pagaditoRequest.affiliate_id = this.user.id;

    let detail = new PagaditoTransactionDetailRequest();
    detail.quantity = 1;
    detail.description = this.currentMembership.description;
    detail.price = this.currentMembership.salePrice * 1.10;
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
      confirmButtonText: 'Sí, realizar pago'
    }).then((result) => {
      if (result.isConfirmed) {
        this.executePagaditoTransaction();
      }
    });
  }

  executePagaditoTransaction() {
    this.pagaditoService.createTransaction(this.pagaditoRequest).subscribe({
      next: (response) => {
        if (response.success) {
          window.open(response.data);
          this.showPostPaymentModal();
        }
      },
      error: (err) => {
        console.log(err);
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al procesar el pago. Por favor, intente nuevamente.',
          icon: 'error',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Cerrar'
        });
      },
    });
  }

  showPostPaymentModal() {
    Swal.fire({
      title: 'Pago en Proceso',
      text: 'Una vez realizado el pago, el sistema activará automáticamente al usuario.',
      icon: 'info',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Entendido'
    });
  }
}
