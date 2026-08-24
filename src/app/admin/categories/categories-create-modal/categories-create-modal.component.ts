import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {ProductCategory} from "../../../core/models/product-category-model/product-category.model";
import {ProductCategoryService} from "../../../core/service/product-category-service/product-category.service";
import { NgClass, CommonModule } from "@angular/common";

@Component({
  selector: 'app-categories-create-modal',
  templateUrl: './categories-create-modal.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgClass
  ]
})
export class CategoriesCreateModalComponent implements OnInit {
  createCategorieForm!: FormGroup;
  submitted = false;
  checkboxSmallBanner = false;
  checkboxBigBanner = false;
  selectedFile: File = null;
  categories = [];
  productCategory: ProductCategory = new ProductCategory();

  @ViewChild('categoriesCreateModal') categoriesCreateModal: NgbModal;
  @Output('loadCategoryList') loadCategoryList: EventEmitter<any> =
    new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private productCategoryService: ProductCategoryService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.categorieValidation();
    this.categoryList();
  }

  get create_categorie_controls(): { [key: string]: AbstractControl } {
    return this.createCategorieForm.controls;
  }

  categorieValidation() {
    this.createCategorieForm = this.formBuilder.group({
      categorie: [0],
      name: ['', Validators.required],
      description: [''],
      activate_big_banner: [],
      activate_small_banner: [],
    });
  }

  onFileSelected(event) {
    this.selectedFile = <File>event.target.files[0];
  }

  onChangeSmallBanner() {
    this.checkboxSmallBanner = !this.checkboxSmallBanner;
  }

  onChangeBigBanner() {
    this.checkboxBigBanner = !this.checkboxBigBanner;
  }

  closeModals() {
    this.modalService.dismissAll();
  }

  showSuccess(message: string) {
    this.toastr.success(message, 'Success!');
  }

  onAddRowSave() {
    this.submitted = true;
    if (this.createCategorieForm.invalid) {
      return;
    }

    this.productCategory.name = this.createCategorieForm.value.name;
    this.productCategory.category = parseInt(this.createCategorieForm.value.categorie);
    this.productCategory.description = this.createCategorieForm.value.description;
    this.productCategory.displaySmallBanner = this.createCategorieForm.value.activate_small_banner ?? false;
    this.productCategory.displayBigBanner = this.createCategorieForm.value.activate_big_banner ?? false;

    this.productCategoryService.createCategory(this.productCategory).subscribe((resp) => {

      if (resp.success) {
        this.showSuccess('The category was created successfully!');
        this.closeModals();
        this.createCategorieForm.reset();
        this.loadCategoryList.emit();
      }
    })

  }

  categoryList() {
    this.productCategoryService.getAll().subscribe((resp) => {
      this.categories = resp;
    });
  }


}
