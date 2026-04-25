import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl, ReactiveFormsModule, FormsModule,
} from '@angular/forms';
import {
  NgbModal,
  NgbNav,
  NgbNavContent,
  NgbNavItem,
  NgbNavLink,
  NgbNavOutlet,
  NgbTooltip
} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';

import {ProductAttributeService} from '../../../core/service/product-attribute/product-attribute.service';
import {Product} from "../../../core/models/product-model/product.model";
import {ProductCombination} from "../../../core/models/product-combination-model/product-combination.model";
import {ProductDiscount} from "../../../core/models/product-discount-model/product-discount.model";
import {ProductInventory} from "../../../core/models/product-inventory-model/product-inventory.model";
import {ProductAttribute} from "../../../core/models/product-attribute-model/product-attribute.model";
import {ProductAttributeValue} from "../../../core/models/product-attribute-value-model/product-attribute-value.model";
import {ProductService} from "../../../core/service/product-service/product.service";
import {ProductDiscountService} from "../../../core/service/product-discount-service/product-discount.service";
import {GradingService} from "../../../core/service/grading-service/grading.service";
import {ProductCategoryService} from "../../../core/service/product-category-service/product-category.service";
import {
  ProductAttributeValueService
} from "../../../core/service/product-attribute-value/product-attribute-value.service";
import {ProductCombinationService} from "../../../core/service/product-combination-service/product-combination.service";
import {ProductInventoryService} from "../../../core/service/product-inventory-service/product-inventory.service";
import {NgClass} from "@angular/common";
import {CKEditorModule} from "@ckeditor/ckeditor5-angular";
import {NgxDropzoneModule} from "ngx-dropzone";
import {TranslatePipe} from "@ngx-translate/core";
import {ObjectStorageService} from "../../../core/service/object-storage-service/object-storage.service";


@Component({
  selector: 'app-products-and-services-edit-modal',
  templateUrl: './products-and-services-edit-modal.component.html',
  standalone: true,
  imports: [
    NgbNavItem,
    NgbNav,
    ReactiveFormsModule,
    NgClass,
    NgbNavLink,
    NgbNavContent,
    FormsModule,
    DatatableComponent,
    DataTableColumnDirective,
    DataTableColumnCellDirective,
    CKEditorModule,
    NgxDropzoneModule,
    TranslatePipe,
    NgbNavOutlet,
    NgbTooltip
  ]
})
export class ProductsAndServicesEditModalComponent implements OnInit {
  public Editor = ClassicEditor;
  isCheckedAttribute: boolean = false;
  isCheckedInventory: boolean = false;
  editProductForm!: FormGroup;
  editProductAttributesForm!: FormGroup;
  editProductContentHtmlForm!: FormGroup;
  editProductDiscountForm!: FormGroup;
  editProductInventoryForm!: FormGroup;
  submittedProduct = false;
  submittedAttribute = false;
  submittedDiscount = false;
  submittedInventory = false;
  active = 1;
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  rows = [];
  temp = [];
  rowsCombinations = [];
  tempCombinations = [];
  calificationList = [];
  categoriesList = [];
  product: Product = new Product();
  productCombination: ProductCombination = new ProductCombination();
  productDiscount: ProductDiscount = new ProductDiscount();
  productInventory: ProductInventory = new ProductInventory();
  attributesList: ProductAttribute[];
  attributesValuesList: ProductAttributeValue[];

  @ViewChild('fileInput') fileInput: ElementRef;
  uploadTask: any;
  fileRef: any;
  files: File[] = [];
  progress = 0;

  @ViewChild('editProductModal') editProductModal: NgbModal;
  @ViewChild('table') table: DatatableComponent;
  @Output('loadProductList') loadProductList: EventEmitter<any> =
    new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private productService: ProductService,
    private productDiscountService: ProductDiscountService,
    private gradingService: GradingService,
    private productCategoryService: ProductCategoryService,
    private productAttributeValueService: ProductAttributeValueService,
    private productAttributeService: ProductAttributeService,
    private productCombinationService: ProductCombinationService,
    private productInventoryService: ProductInventoryService,
    private objectStorageService: ObjectStorageService
  ) {
  }

  ngOnInit(): void {
    this.productValidation();
    this.productAttributesValidation();
    this.productContentHtmlValidation();
    this.productDiscountValidation();
    this.productInventoryValidation();
    this.loadCalificationList();
    this.loadCategoryList();
    this.getAttributesList();

  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    if (this.table) {
      this.table.recalculate();
      this.table.recalculateColumns();
    }
  }

  getRowHeight(row) {
    return row.height;
  }

  get edit_product_controls(): { [key: string]: AbstractControl } {
    return this.editProductForm.controls;
  }

  get edit_product_attributes_controls(): { [key: string]: AbstractControl } {
    return this.editProductAttributesForm.controls;
  }

  get edit_product_discount_controls(): { [key: string]: AbstractControl } {
    return this.editProductDiscountForm.controls;
  }

  get edit_product_inventory_controls(): { [key: string]: AbstractControl } {
    return this.editProductInventoryForm.controls;
  }

  editOpenModal(content, row) {
    this.product = row;
    this.loadDiscountListByProductId(this.product.id);
    this.loadCombinationsList(this.product.id);
    // this.setFilesFromProductImage();

    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });

    this.editProductForm.setValue({
      name: this.product.name,
      bar_code: this.product.productCode,
      description: this.product.description,
      category: this.product.categoryId,
      keyword: this.product.keyWord,
      calculate_group: this.product.paymentGroup,
      sale_price: this.product.salePrice,
      taxes: this.product.tax,
      commissionable_value: this.product.commissionableValue,
      binary_points: this.product.binaryPoints,
      qualified_points: this.product.associatedQualification,
      product_weight: this.product.weight,
      inventory: this.product.inventory,
      minimum_purchase: this.product.acumCompMin,
      visible_product: this.product.visible,
      product_visible_public_store: this.product.visiblePublic,
      product_type: this.product.productType,
      hide_points: this.product.hidePoint,
      pack_product: this.product.productPacks,
      offer: this.product.offer,
      hide_commissionable_value: this.product.hideCommissionable,
      activate_gallery_zoom: this.product.activeZoomPhotos,
      recurring_product: this.product.recurringProduct,
      product_home: this.product.productHome,
      base_amount_pack: this.product.baseAmount,
      amount_day_pay: this.product.amountDayPay,
      days_wait: this.product.daysWait
    });
    this.isCheckedAttribute = this.product.activateCombinations;
    this.isCheckedInventory = this.product.inventory;
  }

  closeModals() {
    this.modalService.dismissAll();
  }

  showSuccess(message) {
    this.toastr.success(message, 'Success!');
  }

  productValidation() {
    this.editProductForm = this.formBuilder.group({
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
      minimum_purchase: [],
      visible_product: [],
      product_visible_public_store: [],
      product_type: [],
      hide_points: [],
      pack_product: [],
      offer: [],
      hide_commissionable_value: [],
      activate_gallery_zoom: [],
      recurring_product: [],
      product_home: [],
      base_amount_pack: [],
      amount_day_pay: [],
      days_wait: []
    });
  }

  productAttributesValidation() {
    this.editProductAttributesForm = this.formBuilder.group({
      attribute_name: [''],
      attribute_value: [''],
      attribute_combination: [{value: '', disabled: true}],
      attribute_reference: [],
    });
  }

  productContentHtmlValidation() {
    this.editProductContentHtmlForm = this.formBuilder.group({
      enable_content_html: [''],
    });
  }

  productDiscountValidation() {
    this.editProductDiscountForm = this.formBuilder.group({
      discount_name: ['', Validators.required],
      discount_description: [''],
      discount_calification: ['', Validators.required],
      discount_percentage: ['', Validators.required],
      discount_percentage_commissionable: [''],
      discount_commissionable: [],
      discount_percentage_binary_points: [''],
      discount_binary_points: [],
      discount_percentage_qualified_points: [''],
      discount_qualified_points: [],
    });
  }

  productInventoryValidation() {
    this.editProductInventoryForm = this.formBuilder.group({
      inventory_note: ['', Validators.required],
      inventory_support: [''],
      inventory_combination: [''],
      inventory_quantity: [''],
      inventory_type: [''],
    });
  }

  onSaveProduct() {
    this.submittedProduct = true;
    if (this.editProductForm.invalid) {
      return;
    }

    this.product.name = this.editProductForm.value.name;
    this.product.productCode = this.editProductForm.value.bar_code;
    this.product.description = this.editProductForm.value.description;
    this.product.categoryId = parseInt(this.editProductForm.value.category);
    this.product.keyWord = this.editProductForm.value.keyword;
    this.product.paymentGroup = parseInt(
      this.editProductForm.value.calculate_group
    );
    this.product.salePrice = this.editProductForm.value.sale_price;
    this.product.tax = this.editProductForm.value.taxes;
    this.product.commissionableValue =
      this.editProductForm.value.commissionable_value;
    this.product.binaryPoints = this.editProductForm.value.binary_points;
    this.product.associatedQualification =
      this.editProductForm.value.qualified_points;
    this.product.weight = this.editProductForm.value.product_weight;
    this.product.inventory = this.editProductForm.value.inventory ?? false;
    this.product.acumCompMin = this.editProductForm.value.minimum_purchase;
    this.product.visible = this.editProductForm.value.visible_product;
    this.product.visiblePublic =
      this.editProductForm.value.product_visible_public_store;
    this.product.productType = this.editProductForm.value.product_type ?? false;
    this.product.hidePoint = this.editProductForm.value.hide_points ?? false;
    this.product.productPacks =
      this.editProductForm.value.pack_product ?? false;
    this.product.offer = this.editProductForm.value.offer ?? false;
    this.product.hideCommissionable =
      this.editProductForm.value.hide_commissionable_value ?? false;
    this.product.activeZoomPhotos =
      this.editProductForm.value.activate_gallery_zoom ?? false;
    this.product.recurringProduct =
      this.editProductForm.value.recurring_product ?? false;
    this.product.productHome = this.editProductForm.value.product_home ?? false;
    this.product.amountDayPay = this.editProductForm.value.amount_day_pay;
    this.product.baseAmount = this.editProductForm.value.base_amount_pack;
    this.product.daysWait = this.editProductForm.value.days_wait;

    this.productService.updateProduct(this.product).subscribe((resp) => {
      if (resp.success) {
        this.showSuccess('The product was update successfully!');
        this.closeModals();
        this.loadProductList.emit();
      }
    });
  }

  onSaveProductAttribute() {
    this.submittedAttribute = true;
    if (this.editProductAttributesForm.invalid) {
      return;
    }

    this.productCombination.idAttributes = parseInt(
      this.editProductAttributesForm.value.attribute_name
    );
    this.productCombination.idProduct = this.product.id;
    this.productCombination.displayBigBanner =
      this.product.productsCategory.displayBigBanner;

    this.productCombinationService
      .createProductCombination(this.productCombination)
      .subscribe((resp) => {
        if (resp.success) {
          this.showSuccess('The product combination was create successfully!');
          this.editProductAttributesForm.reset();
          this.loadCombinationsList(this.product.id);
        }
      });
  }

  onSaveProductDiscount() {
    this.submittedDiscount = true;
    if (this.editProductForm.invalid) {
      return;
    }

    this.productDiscount.idProduct = this.product.id;
    this.productDiscount.name =
      this.editProductDiscountForm.value.discount_name;
    this.productDiscount.description =
      this.editProductDiscountForm.value.discount_description;
    this.productDiscount.qualification =
      this.editProductDiscountForm.value.discount_calification;
    this.productDiscount.percentage =
      this.editProductDiscountForm.value.discount_percentage;
    this.productDiscount.pCommissionable =
      this.editProductDiscountForm.value.discount_percentage_commissionable;
    this.productDiscount.pBinaryPoints =
      this.editProductDiscountForm.value.discount_percentage_binary_points;
    this.productDiscount.pPointsQualify =
      this.editProductDiscountForm.value.discount_percentage_qualified_points;
    this.productDiscount.pointsQualify =
      this.editProductDiscountForm.value.discount_qualified_points ?? false;
    this.productDiscount.binaryPoints =
      this.editProductDiscountForm.value.discount_binary_points ?? false;
    this.productDiscount.commissionable =
      this.editProductDiscountForm.value.discount_commissionable ?? false;

    this.productDiscountService
      .createProductDiscount(this.productDiscount)
      .subscribe((resp) => {
        if (resp.success) {
          this.showSuccess('The product discount was create successfully!');
          this.editProductDiscountForm.reset();
          this.loadDiscountListByProductId(this.product.id);
        }
      });
  }

  onSaveProductInventory() {
    this.submittedInventory = true;
    if (this.editProductInventoryForm.invalid) {
      return;
    }

    this.productInventory.idProduct = this.product.id;
    this.productInventory.note = this.editProductInventoryForm.value.inventory_note;
    this.productInventory.support = this.editProductInventoryForm.value.inventory_support;
    this.productInventory.idCombination = parseInt(this.editProductInventoryForm.value.inventory_combination);
    this.productInventory.type = parseInt(this.editProductInventoryForm.value.inventory_type);

    if (this.productInventory.type === 0) {
      this.productInventory.ingress = this.editProductInventoryForm.value.inventory_quantity;
      this.productInventory.egress = 0;
    } else {
      this.productInventory.egress = this.editProductInventoryForm.value.inventory_quantity;
      this.productInventory.ingress = 0;
    }

    this.productInventoryService.createProductInventory(this.productInventory).subscribe((resp) => {
      if (resp.success) {
        this.showSuccess('The product inventory was create successfully!');
      }
    });

  }

  deleteSingleRowDiscount(value) {
    Swal.fire({
      title: 'Are you sure?',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.value) {
        this.deleteRecordDiscount(value);
      }
    });
  }

  deleteRecordSuccess(count) {
    this.toastr.success(count + ' Records Deleted Successfully', '');
  }

  deleteRecordDiscount(id: number) {
    this.productDiscountService.delete(id).subscribe((response) => {
      if (response.success) {
        this.deleteRecordSuccess(1);
        this.loadDiscountListByProductId(this.product.id);
      }
    });
  }

  deleteSingleRowCombination(value) {
    Swal.fire({
      title: 'Are you sure?',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.value) {
        this.deleteRecordCombination(value);
      }
    });
  }

  deleteRecordCombination(id: number) {
    this.productCombinationService.delete(id).subscribe((response) => {
      if (response.success) {
        this.deleteRecordSuccess(1);
        this.loadCombinationsList(this.product.id);
      }
    });
  }

  checkboxChangedAttribute() {
    this.product.activateCombinations = this.isCheckedAttribute;
    this.productService.updateProduct(this.product).subscribe(() => {
      if (this.product.activateCombinations) {
        this.showSuccess('Product attributes have been activated!');
        this.loadProductList.emit();
      } else {
        this.showSuccess('Product attributes have been deactivated!');
        this.loadProductList.emit();
      }
    });
  }

  getAttributesList() {
    this.productAttributeService
      .getAll()
      .subscribe((resp: ProductAttribute[]) => {
        if (resp != null) {
          this.attributesList = resp;
        }
      });
  }

  getNameValue(event) {
    let idAttribute: number =
      this.editProductAttributesForm.value.attribute_name;
    let value = this.editProductAttributesForm.value.attribute_value;

    const foundAttributeName = this.attributesList.find(
      (item) => item.id == idAttribute
    );
    if (foundAttributeName) {
      this.editProductAttributesForm.patchValue({
        attribute_combination: foundAttributeName.name + ' : ' + value,
      });
    }
    this.productCombination.codeRef = foundAttributeName.name + ' : ' + value;
  }

  getAttributesValues(event) {
    this.editProductAttributesForm.patchValue({
      attribute_combination: '',
    });
    let id = event.target.value;
    if (id != null && id != '') {
      this.productAttributeValueService
        .getAttributeValueByAttributeId(id)
        .subscribe((resp: ProductAttributeValue[]) => {
          if (resp != null) {
            this.attributesValuesList = resp;
          }
        });
    } else {
      this.attributesValuesList = [];
    }
  }

  loadDiscountListByProductId(id) {
    this.productDiscountService
      .getAllProductsDiscountByProductId(id)
      .subscribe((resp: ProductDiscount[]) => {
        this.temp = [...resp];
        this.rows = resp;
        this.loadingIndicator = false;
      });
  }

  loadCalificationList() {
    this.gradingService.getAll().subscribe((resp) => {
      if (resp !== null) {
        this.calificationList = resp;
      }
    });
  }

  loadCategoryList() {
    this.productCategoryService.getAll().subscribe((resp) => {
      this.categoriesList = resp;
    });
  }

  loadCombinationsList(id: number) {
    this.productCombinationService
      .getProductCombinationByProductId(id)
      .subscribe((resp) => {
        if (resp != null) {
          this.tempCombinations = [...resp];
          this.rowsCombinations = resp;
        }
      });
  }

  onFileSelected(event: any): void {
    const file = event.addedFiles[0];
    this.files.push(file);

    this.startUpload();

  }

  startUpload(): void {
    if (!this.files[0]) {
      this.toastr.error('No file selected');
      return;
    }

    let toastReference = this.toastr.info('Upload started...', 'Progress', {
      progressBar: true,
      progressAnimation: 'increasing',
      timeOut: 0,
      extendedTimeOut: 0,
      disableTimeOut: true,
      tapToDismiss: false
    });

    this.objectStorageService.uploadProductImage(this.files[0], this.product.id).subscribe({
      next: (downloadURL) => {
        this.product.image = downloadURL;
        this.productService.updateProduct(this.product).subscribe({
          next: () => {
            this.toastr.clear(toastReference.toastId);
            this.toastr.success('Image updated successfully');
            this.files = [];
          },
          error: (err) => {
            console.error('Error updating product:', err);
            this.toastr.error('Error updating product');
          }
        });
      },
      error: (error) => {
        console.error('Upload failed:', error);
        this.toastr.error('Upload failed');
      }
    });
  }

  deleteImage() {
    this.product.image = null;
    this.productService.updateProduct(this.product).subscribe({
      next: () => {
        this.showSuccess('Image deleted successfully');
      },
      error: () => {
        this.toastr.error('error');

      },
    })

    this.files = [];
  }

  deleteFile(f: File): void {
    if (0 > -1) {
      this.files.splice(0, 1);
    }
  }

}
