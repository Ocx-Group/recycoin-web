import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup, ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {NgbModal, NgbTooltip} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {Product} from "../../../core/models/product-model/product.model";
import {PaymentGroupsService} from "../../../core/service/payment-groups-service/payment-groups.service";
import {ProductCategoryService} from "../../../core/service/product-category-service/product-category.service";
import {ProductService} from "../../../core/service/product-service/product.service";
import {PaymentGroup} from "../../../core/models/payment-group-model/payment.group.model";
import { NgClass, CommonModule } from "@angular/common";


@Component({
  selector: 'app-products-and-services-create-modal',
  templateUrl: './products-and-services-create-modal.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgClass,
    NgbTooltip
  ]
})
export class ProductsAndServicesCreateModalComponent implements OnInit {
  createProductForm!: FormGroup;
  submitted = false;
  product: Product = new Product();
  paymentsGroup = [];
  categoriesList = [];

  @ViewChild('createProductModal') createProductModal: NgbModal;
  @Output('loadProductList') loadProductList: EventEmitter<any> =
    new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private paymentGroupService: PaymentGroupsService,
    private productCategoryService: ProductCategoryService,
    private productService: ProductService
  ) {
  }

  ngOnInit(): void {
    this.productValidation();
    this.loadCalculationList();
    this.loadCategoryList();
  }

  get create_product_controls(): { [key: string]: AbstractControl } {
    return this.createProductForm.controls;
  }

  productValidation() {
    this.createProductForm = this.formBuilder.group({
      name: ['', Validators.required],
      bar_code: [''],
      description: [''],
      category: [''],
      keyword: [''],
      calculate_group: ['', Validators.required],
      sale_price: ['', Validators.required],
      taxes: [''],
      commissionable_value: [''],
      binary_points: [''],
      qualified_points: [''],
      product_weight: [''],
      inventory: [],
      minimum_purchase: [true],
      visible_product: [true],
      product_visible_public_store: [true],
      product_type: [],
      hide_points: [],
      pack_product: [],
      offer: [],
      hide_commissionable_value: [],
      activate_gallery_zoom: [],
      recurring_product: [],
      product_home: [],
    });
  }

  closeModals() {
    this.modalService.dismissAll();
  }

  showSuccess(message) {
    this.toastr.success(message, 'Success!');
  }

  onAddRowSave() {
    this.submitted = true;
    if (this.createProductForm.invalid) {
      return;
    }

    this.product.name = this.createProductForm.value.name;
    this.product.productCode = this.createProductForm.value.bar_code;
    this.product.description = this.createProductForm.value.description;
    this.product.categoryId = parseInt(this.createProductForm.value.category);
    this.product.keyWord = this.createProductForm.value.keyword;
    this.product.paymentGroup = parseInt(this.createProductForm.value.calculate_group);
    this.product.salePrice = this.createProductForm.value.sale_price;
    this.product.tax = this.createProductForm.value.taxes;
    this.product.commissionableValue = this.createProductForm.value.commissionable_value;
    this.product.binaryPoints = this.createProductForm.value.binary_points;
    this.product.associatedQualification = this.createProductForm.value.qualified_points;
    this.product.weight = this.createProductForm.value.product_weight;
    this.product.inventory = this.createProductForm.value.inventory ?? false;
    this.product.acumCompMin = this.createProductForm.value.minimum_purchase;
    this.product.visible = this.createProductForm.value.visible_product;
    this.product.visiblePublic = this.createProductForm.value.product_visible_public_store;
    this.product.productType = this.createProductForm.value.product_type ?? false;
    this.product.hidePoint = this.createProductForm.value.hide_points ?? false;
    this.product.productPacks = this.createProductForm.value.pack_product ?? false;
    this.product.offer = this.createProductForm.value.offer ?? false;
    this.product.hideCommissionable = this.createProductForm.value.hide_commissionable_value ?? false;
    this.product.activeZoomPhotos = this.createProductForm.value.activate_gallery_zoom ?? false;
    this.product.recurringProduct = this.createProductForm.value.recurring_product ?? false;
    this.product.productHome = this.createProductForm.value.product_home ?? false;


    this.productService.createProduct(this.product).subscribe((resp) => {

      if (resp.success) {
        this.showSuccess('The product was created successfully!');
        this.closeModals();
        this.createProductForm.reset();
        this.loadProductList.emit();
      }
    });
  }

  loadCalculationList() {
    this.paymentGroupService
      .getAll()
      .subscribe((paymentGroups: PaymentGroup[]) => {
        if (paymentGroups !== null) {
          this.paymentsGroup = paymentGroups;
        }
      });
  }

  loadCategoryList() {
    this.productCategoryService.getAll().subscribe((resp) => {
      this.categoriesList = resp;
    });
  }
}
