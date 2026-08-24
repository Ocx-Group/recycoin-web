import {Component, EventEmitter, OnInit, Output, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup, ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {ProductAttribute} from "../../../core/models/product-attribute-model/product-attribute.model";
import {ProductAttributeService} from "../../../core/service/product-attribute/product-attribute.service";
import { NgClass, CommonModule } from "@angular/common";

@Component({
  selector: 'app-attributes-list-edit-modal',
  templateUrl: './attributes-list-edit-modal.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgClass
  ],
})
export class AttributesListEditModalComponent implements OnInit {
  editAttributeForm!: FormGroup;
  submitted = false;
  productAttribute: ProductAttribute = new ProductAttribute();
  attributesType: [];

  @ViewChild('attributesEditModal') attributesEditModal: NgbModal;
  @Output('loadAttributesList') loadAttributesList: EventEmitter<any> =
    new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private productAttributeService: ProductAttributeService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.attributeValidation();
    this.getAttributesType();
  }

  attributeValidation() {
    this.editAttributeForm = this.formBuilder.group({
      name: ['', Validators.required],
      attribute_type: ['', Validators.required],
      description: [],
      position: ['', Validators.required],
    });
  }

  get edit_attribute_controls(): { [key: string]: AbstractControl } {
    return this.editAttributeForm.controls;
  }

  getAttributesType() {
    this.productAttributeService.getAttributeType().subscribe((resp) => {
      this.attributesType = resp;
    });
  }

  onAddRowSave() {
    this.submitted = true;
    if (this.editAttributeForm.invalid) {
      return;
    }

    this.productAttribute.name = this.editAttributeForm.value.name;
    this.productAttribute.attribute = parseInt(this.editAttributeForm.value.attribute_type);
    this.productAttribute.description = this.editAttributeForm.value.description;
    this.productAttribute.position = this.editAttributeForm.value.position;
    this.productAttributeService.updateProductAttribute(this.productAttribute).subscribe((resp) => {
      if (resp.success) {
        this.showSuccess('The attribute was update successfully!');
        this.closeModals();
        this.loadAttributesList.emit();
      }
    })
  }

  editOpenModal(content, row) {
    this.productAttribute = row;
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });
    this.editAttributeForm.setValue({
      name: this.productAttribute.name,
      attribute_type: this.productAttribute.attribute,
      description: this.productAttribute.description,
      position: this.productAttribute.position,
    });
  }

  closeModals() {
    this.modalService.dismissAll();
  }

  showSuccess(message) {
    this.toastr.success(message, 'Success!');
  }
}
