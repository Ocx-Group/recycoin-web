import {Component, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl, ReactiveFormsModule,
} from '@angular/forms';
import {NgbModal, NgbTooltip} from '@ng-bootstrap/ng-bootstrap';
import { NgClass, CommonModule } from "@angular/common";

@Component({
  selector: 'app-products-services-configurations-create-carrier-modal',
  templateUrl: './products-services-configurations-create-carrier-modal.component.html',
  styleUrls: [
    'products-services-configurations-create-carrier-modal.component.scss',
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgClass,
    NgbTooltip
  ],
})
export class ProductsServicesConfigurationsCreateCarrierModalComponent implements OnInit {
  title = 'angular13bestcode';
  generalParameters!: FormGroup;
  placeShippingCosts!: FormGroup;
  summary!: FormGroup;
  general_parameters_step = false;
  place_shipping_costs_step = false;
  summary_step = false;
  step = 1;

  @ViewChild('carrierCreateModal') carrierCreateModal: NgbModal;

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.generalParameters = this.formBuilder.group({
      carrier_name: ['', Validators.required],
      delivery_time: ['', Validators.required],
    });

    this.placeShippingCosts = this.formBuilder.group({
      commission_shipment: [''],
      out_range: [''],
      include_maintenance_costs: [''],
      free_delivery: [''],
      billing: [''],
      range_1: ['', Validators.required],
      range_2: ['', Validators.required],
      zone: ['', Validators.required],
      cost: ['', Validators.required],
    });

    this.summary = this.formBuilder.group({});
  }

  get general_parameters_controls(): { [key: string]: AbstractControl } {
    return this.generalParameters.controls;
  }

  get place_shipping_costs_controls(): { [key: string]: AbstractControl } {
    return this.placeShippingCosts.controls;
  }

  next() {
    if (this.step == 1) {
      this.general_parameters_step = true;
      if (this.generalParameters.invalid) {
        return;
      }
      this.step++;
    } else if (this.step == 2) {
      this.place_shipping_costs_step = true;
      if (this.placeShippingCosts.invalid) {
        return;
      }
      this.step++;
    }
  }

  previous() {
    this.step--;

    if (this.step == 1) {
      this.place_shipping_costs_step = false;
    }
    if (this.step == 2) {
      this.summary_step = false;
    }
  }

  submit() {
    if (this.step == 3) {
      this.summary_step = true;
      if (this.summary.invalid) {
        return;
      }
      alert('Well done!!');
    }
  }
}
