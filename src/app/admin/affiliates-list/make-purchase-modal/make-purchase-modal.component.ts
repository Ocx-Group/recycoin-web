import {Component, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import Swal from 'sweetalert2';
import {UserAffiliate} from "@app/core/models/user-affiliate-model/user.affiliate.model";
import {ProductsRequests, WalletRequest} from "@app/core/models/wallet-model/wallet-request.model";
import {WalletService} from "@app/core/service/wallet-service/wallet.service";
import {ProductService} from "@app/core/service/product-service/product.service";
import {Product} from "@app/core/models/product-model/product.model";


@Component({
  selector: 'app-make-purchase-modal',
  templateUrl: './make-purchase-modal.component.html',
  styleUrls: ['./make-purchase-modal.component.sass'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    ReactiveFormsModule
]
})
export class MakePurchaseModalComponent implements OnInit {
  makePurchaseForm: FormGroup;
  @ViewChild('makePurchaseModal') makePurchaseModal: NgbModal;
  public walletRequest: WalletRequest = new WalletRequest();
  public products: any = [];
  user: UserAffiliate = new UserAffiliate();
  public productList: any;
  public filterCategory: any;

  constructor(private modalService: NgbModal,
              private walletService: WalletService,
              private toastr: ToastrService,
              private productService: ProductService) {
  }

  ngOnInit(): void {
    this.loadAllEcoPooles();
    this.initMakePurchaseForm();
  }

  initMakePurchaseForm() {
    this.makePurchaseForm = new FormGroup({
      selectedProduct: new FormControl('', Validators.required),
      quantity: new FormControl(1, Validators.required),
      dailyBonusActivation: new FormControl(false),
      includeInCommissionCalculation: new FormControl(false)
    });
  }

  openMakePurchaseModal(content: NgbModal, user: UserAffiliate) {
    this.user = user;

    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      centered: true,
    });
  }

  processPayment(option: number) {
    this.walletRequest.productsList = [];
    this.walletRequest.affiliateId = this.user.id;
    this.walletRequest.affiliateUserName = this.user.user_name;
    this.walletRequest.paymentMethod = option;
    this.walletRequest.purchaseFor = 0;
    this.walletRequest.dailyBonusActivation = this.makePurchaseForm.get('dailyBonusActivation')?.value || false;
    this.walletRequest.includeInCommissionCalculation = this.makePurchaseForm.get('includeInCommissionCalculation')?.value || false;

    this.products.forEach((item: { id: number; quantity: number; }) => {
      const productRequest = new ProductsRequests();
      productRequest.idProduct = item.id;
      productRequest.count = item.quantity;
      this.walletRequest.productsList.push(productRequest);
    });

    console.log("Enviando request al backend", this.walletRequest);

    this.walletService.payWithMyBalanceAdmin(this.walletRequest).subscribe({
      next: value => {
        if (value.success) {
          this.showSuccess('Pago realizado correctamente');
          this.walletRequest.productsList = [];
          this.products = [];
          this.modalService.dismissAll();
        } else {
          this.showError('Error: No se pudo realizar el pago.');
        }
      },
      error: () => {
        this.showError('Error: No se pudo realizar el pago.');
      },
    });
  }

  showSuccess(message: string) {
    this.toastr.success(message);
  }

  showError(message: string) {
    this.toastr.error(message);
  }

  loadAllEcoPooles() {
    this.productService.getAllRecyCoin().subscribe((ecopools: Product) => {
      this.productList = ecopools;
      this.filterCategory = ecopools;
      this.productList.forEach((item: any) => {
        Object.assign(item, {quantity: 1, total: item.salePrice});
      });
    });
  }

  addProductToList() {
    const selectedProduct = this.productList.find((p: {
      id: any;
    }) => p.id == this.makePurchaseForm.get('selectedProduct').value);
    const quantity = this.makePurchaseForm.get('quantity').value;

    const existingProduct = this.products.find((p: { id: any; }) => p.id == selectedProduct.id);
    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      this.products.push({
        ...selectedProduct,
        quantity: quantity,
      });
    }

    this.makePurchaseForm.patchValue({
      selectedProduct: '',
      quantity: 1
    });
  }

  removeProductFromList(product: { id: any; }) {
    const index = this.products.findIndex((p: { id: any; }) => p.id == product.id);
    if (index !== -1) {
      this.products.splice(index, 1);
    }
  }

  confirmPurchase(option: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres realizar la compra?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, comprar!',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (result.isConfirmed) {
        this.processPayment(option);
      }
    });
  }
}
