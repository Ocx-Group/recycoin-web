import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
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
  selector: 'app-attributes-list-create-modal',
  templateUrl: './attributes-list-create-modal.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgClass
  ],
})
export class AttributesListCreateModalComponent implements OnInit {
  createAttributeForm!: FormGroup;
  submitted = false;
  attributesType: [];
  productAttributes: ProductAttribute = new ProductAttribute();

  @ViewChild('attributesCreateModal') attributesCreateModal: NgbModal;
  @Output('loadAttributesList') loadAttributesList: EventEmitter<any> =
    new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private productAttributeService: ProductAttributeService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.attributeValidation();
    this.getAttributesType();
  }

  attributeValidation() {
    this.createAttributeForm = this.formBuilder.group({
      name: ['', Validators.required],
      attribute_type: ['', Validators.required],
      description: [],
      position: ['', Validators.required],
    });
  }

  get create_attribute_controls(): { [key: string]: AbstractControl } {
    return this.createAttributeForm.controls;
  }

  onAddRowSave() {
    this.submitted = true;
    if (this.createAttributeForm.invalid) {
      return;
    }

    this.productAttributes.name = this.createAttributeForm.value.name;
    this.productAttributes.description =
      this.createAttributeForm.value.description;
    this.productAttributes.attribute =
      this.createAttributeForm.value.attribute_type;
    this.productAttributes.position = this.createAttributeForm.value.position;


    this.productAttributeService
      .createProductAttribute(this.productAttributes)
      .subscribe((resp) => {
        if (resp.success) {
          this.showSuccess('The attribute was created successfully!');
          this.closeModals();
          this.createAttributeForm.reset();
          this.loadAttributesList.emit();
        }
      });
  }

  getAttributesType() {
    this.productAttributeService.getAttributeType().subscribe((resp) => {
      this.attributesType = resp;
    });
  }

  closeModals() {
    this.modalService.dismissAll();
  }

  showSuccess(message) {
    this.toastr.success(message, 'Success!');
  }
}
