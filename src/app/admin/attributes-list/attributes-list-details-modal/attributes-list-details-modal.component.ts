import {Component, HostListener, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  AbstractControl,
  Validators, ReactiveFormsModule,
} from '@angular/forms';
import {NgbModal, NgbNav, NgbNavContent, NgbNavItem, NgbNavLink, NgbNavOutlet} from '@ng-bootstrap/ng-bootstrap';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import {ToastrService} from 'ngx-toastr';
import {ProductAttributeValue} from "../../../core/models/product-attribute-value-model/product-attribute-value.model";
import {ProductAttributeService} from "../../../core/service/product-attribute/product-attribute.service";
import {
  ProductAttributeValueService
} from "../../../core/service/product-attribute-value/product-attribute-value.service";
import { NgClass, CommonModule } from "@angular/common";

@Component({
  selector: 'app-attributes-list-details-modal',
  templateUrl: './attributes-list-details-modal.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, DatatableComponent, ReactiveFormsModule, NgbNav, NgbNavItem, NgbNavContent, NgbNavLink, DataTableColumnDirective, DataTableColumnCellDirective, NgClass, NgbNavOutlet],
})
export class AttributesListDetailsModalComponent implements OnInit {
  active = 1;
  detailsAttributesForm!: FormGroup;
  submitted = false;
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  attributesList = [];
  productAttributeValue: ProductAttributeValue = new ProductAttributeValue();

  @ViewChild('attributesDetailsModal') attributesDetailsModal: NgbModal;
  @ViewChild('table') table: DatatableComponent;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private productAttributeService: ProductAttributeService,
    private productAttributeValueService: ProductAttributeValueService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.loadValidation();
    this.loadAttributesList();
  }

  loadValidation() {
    this.detailsAttributesForm = this.formBuilder.group({
      attribute_group: ['', Validators.required],
      position: ['', Validators.required],
      value: ['', Validators.required],
    });
  }

  get details_attributes_controls(): { [Key: string]: AbstractControl } {
    return this.detailsAttributesForm.controls;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.table) {
      this.scrollBarHorizontal = window.innerWidth < 1200;
      this.table.recalculate();
      this.table.recalculateColumns();
    }
  }

  loadAttributesList() {
    this.productAttributeService.getAll().subscribe((resp) => {
      if (resp != null) {
        this.attributesList = resp;

        this.loadingIndicator = false;
      }
    });
  }

  loadAttributesValuesList(id: number) {
    this.productAttributeValueService
      .getAttributeValueByAttributeId(id)
      .subscribe((resp: ProductAttributeValue[]) => {
        if (resp != null) {
          this.temp = [...resp];
          this.rows = resp;
          this.loadingIndicator = false;
        }
      });
  }

  getRowHeight(row) {
    return row.height;
  }

  closeModals() {
    this.modalService.dismissAll();
  }

  showSuccess(message) {
    this.toastr.success(message, 'Success!');
  }

  detailsOpenModal(content, row) {
    this.productAttributeValue.idAttribute = row;
    this.loadAttributesValuesList(row);
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });
  }

  onAddRowSave() {
    this.submitted = true;
    if (this.detailsAttributesForm.invalid) {
      return;
    }

    this.productAttributeValue.idAttribute = this.detailsAttributesForm.value.attribute_group;
    this.productAttributeValue.position = this.detailsAttributesForm.value.position;
    this.productAttributeValue.attributeValue = this.detailsAttributesForm.value.value;

    this.productAttributeValueService.createProductAttributeValue(this.productAttributeValue).subscribe((resp) => {
      if (resp.success) {
        this.showSuccess('The attribute value was created successfully!');
        this.loadAttributesValuesList(this.productAttributeValue.idAttribute);
        this.detailsAttributesForm.reset();
      }
    });
  }

  deleteSingleRow(value) {
    Swal.fire({
      title: 'Are you sure?',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.value) {
        this.deleteRecord(value);
      }
    });
  }

  deleteRecordSuccess(count) {
    this.toastr.success(count + ' Records Deleted Successfully', '');
  }

  deleteRecord(id: number) {
    this.productAttributeValueService.delete(id).subscribe((response) => {
      if (response.success) {
        this.deleteRecordSuccess(1);
        this.loadAttributesValuesList(this.productAttributeValue.idAttribute);
      }
    });
  }
}
