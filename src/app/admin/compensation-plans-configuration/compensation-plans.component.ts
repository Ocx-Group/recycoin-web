import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {
  CompensationPlansConfiguration
} from "../../core/models/compensation-plans-configuration-model/compensation-plans-configuration.model";
import {ConfigurationService} from "../../core/service/configuration-service/configuration.service";
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";
import {NgbTooltip} from "@ng-bootstrap/ng-bootstrap";


@Component({
  selector: 'app-compensation-plans',
  templateUrl: './compensation-plans.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    RouterLink,
    NgbTooltip
  ]
})
export class CompensationPlansComponent implements OnInit {
  compesationPlansForm!: FormGroup;
  submitted = false;
  compesationPlansConfiguration: CompensationPlansConfiguration =
    new CompensationPlansConfiguration();

  constructor(private configurationService: ConfigurationService,
              private formBuilder: FormBuilder,
              private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.loadValidation();
    this.loadCompesationPlansConfiguration();
  }

  loadValidation() {
    this.compesationPlansForm = this.formBuilder.group({
      automatic_activation: [''],
      automatic_qualification: [''],
      automatic_incentive_calculation: [''],
      automatic_commission_calculation: ['']
    })
  }

  showSuccess(message: string) {
    this.toastr.success(message, 'Success!');
  }

  loadCompesationPlansConfiguration() {
    this.configurationService.getCompensationPlansConfiguration().subscribe((resp: CompensationPlansConfiguration) => {
      if (resp != null) {
        this.compesationPlansForm.setValue({
          automatic_activation: resp.automatic_activation,
          automatic_qualification: resp.automatic_qualification,
          automatic_incentive_calculation: resp.automatic_incentive_calculation,
          automatic_commission_calculation: resp.automatic_commission_calculation
        })
      }
    });
  }

  onSaveConfiguration() {
    this.submitted = true;
    if (this.compesationPlansForm.invalid) {
      return;
    }
    this.compesationPlansConfiguration.automatic_activation = this.compesationPlansForm.value.automatic_activation;
    this.compesationPlansConfiguration.automatic_qualification = this.compesationPlansForm.value.automatic_qualification;
    this.compesationPlansConfiguration.automatic_incentive_calculation = this.compesationPlansForm.value.automatic_incentive_calculation;
    this.compesationPlansConfiguration.automatic_commission_calculation = this.compesationPlansForm.value.automatic_commission_calculation;

    this.configurationService.createCompensationPlansConfiguration(this.compesationPlansConfiguration).subscribe((resp) => {
      if (resp.success) {
        this.showSuccess('The configuration was update successfully!');
        this.loadCompesationPlansConfiguration();
      }
    });
  }
}
