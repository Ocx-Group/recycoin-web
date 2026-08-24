import {forkJoin} from 'rxjs';
import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {formatDate} from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  AbstractControl, ReactiveFormsModule,
} from '@angular/forms';
import {
  NgbDateStruct,
  NgbDateParserFormatter, NgbNav, NgbNavItem, NgbNavLink, NgbNavContent, NgbInputDatepicker, NgbNavOutlet, NgbTooltip,
} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {WalletPeriodService} from "../../core/service/wallet-period-service/wallet-period.service";
import {WalletPeriod} from "../../core/models/wallet-period-model/wallet-period.model";
import {
  WalletRetentionConfigService
} from "../../core/service/wallet-retention-config-service/wallet-retention-config.service";
import {ConfigurationService} from "../../core/service/configuration-service/configuration.service";
import {
  WalletWithdrawalsConfiguration
} from "../../core/models/wallet-withdrawals-configuration-model/wallet-withdrawals-configuration.model";
import {WalletRetentionConfig} from "../../core/models/wallet-retention-config-model/wallet-retention-config.model";
import {
  AdditionalParametersConfiguration
} from "../../core/models/additional-parameters-configuration-model/additional-parameters-configuration.model";
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-wallet-parameters',
  templateUrl: './wallet-parameters.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    TranslatePipe,
    RouterLink,
    NgbNav,
    NgbNavItem,
    NgbNavLink,
    NgbNavContent,
    ReactiveFormsModule,
    NgbInputDatepicker,
    NgbNavOutlet,
    NgbTooltip
  ]
})
export class WalletParametersComponent implements OnInit {
  myForm: FormGroup;
  additionalParameters: FormGroup;
  active = 1;
  model: NgbDateStruct;

  constructor(
    private formBuilder: FormBuilder,
    private walletPeriodService: WalletPeriodService,
    private walletRetentionConfigService: WalletRetentionConfigService,
    private ngbDateParserFormatter: NgbDateParserFormatter,
    private toastr: ToastrService,
    private configurationService: ConfigurationService
  ) {
  }

  ngOnInit(): void {
    this.loadValidation();
    this.loadWalletPeriod();
    this.loadWalletRetentionConf();
    this.loadWalletWithdrawalsConfiguration();
    this.loadAdditionalParametersConfiguration();
  }


  showSuccess(message: string) {
    this.toastr.success(message, 'Success!');
  }

  showError(message: string) {
    this.toastr.error(message, 'Error!');
  }


  get datePickers() {
    return this.myForm.get('datePickers') as FormArray;
  }

  get ranges() {
    return this.myForm.get('ranges') as FormArray;
  }

  loadValidation() {
    this.myForm = this.formBuilder.group({
      datePickers: this.formBuilder.array([]),
      ranges: this.formBuilder.array([]),
      minimum_amount: [],
      maximum_amount: [],
      commission_amount: [],
      activate_invoice_cancellation: [false]
    });

    this.additionalParameters = this.formBuilder.group({
      minutes_validity_code: [],
      activate_confirmation_mails: [],
      concept_wallet_withdrawal: []
    });
  }

  loadAdditionalParametersConfiguration() {
    this.configurationService.getAdditionalParametersWalletConfiguration().subscribe({
      next: (resp) => {
        this.additionalParameters.setValue({
          minutes_validity_code: resp.minutes_validity_code,
          activate_confirmation_mails: resp.activate_confirmation_mails,
          concept_wallet_withdrawal: resp.concept_wallet_withdrawal
        })
      },
      error: () => {
        this.showError('Error!');
      },
    })
  }

  loadWalletWithdrawalsConfiguration() {
    this.configurationService.getWithdrawalsWalletConfiguration().subscribe({
      next: (resp: WalletWithdrawalsConfiguration) => {
        this.myForm.patchValue({
          minimum_amount: resp.minimum_amount,
          maximum_amount: resp.maximum_amount,
          commission_amount: resp.commission_amount,
          activate_invoice_cancellation: resp.activate_invoice_cancellation
        });
      },
      error: () => {
        this.showError('Error!');
      },
    });
  }

  loadWalletPeriod() {
    this.walletPeriodService.getAllWalletsPeriods().subscribe({
      next: (resp) => {
        if (resp != null) {
          const datePickersArray = this.myForm.get('datePickers') as FormArray;
          datePickersArray.clear();

          resp.forEach((pickerValue) => {
            const parsedDate = this.ngbDateParserFormatter.parse(
              pickerValue.date
            );

            const pickerGroup = this.formBuilder.group({
              picker: parsedDate,
              id: pickerValue.id,
            });
            datePickersArray.push(pickerGroup);
          });
        }
      },
      error: () => {
        this.showError('Error!');
      },
    });
  }

  loadWalletRetentionConf() {
    this.walletRetentionConfigService.getAllWalletsRetentionConfig().subscribe({
      next: (resp) => {
        if (resp != null) {
          const rangesArray = this.myForm.get('ranges') as FormArray;
          rangesArray.clear();

          resp.forEach((rangeValue: WalletRetentionConfig) => {
            const rangeGroup = this.formBuilder.group({
              to_date: rangeValue.withdrawalTo,
              from_date: rangeValue.withdrawalFrom,
              percentage_retention: rangeValue.percentage,
              id: rangeValue.id,
            });
            rangesArray.push(rangeGroup);
          });
        }
      },
      error: () => {
        this.showError('Error!');
      },
    });
  }

  addPicker(): void {
    const datePickersFormGroup = this.formBuilder.group({
      picker: [],
      id: [],
    });
    this.datePickers.push(datePickersFormGroup);
  }

  addRangeRetention() {
    const rangesFormGroup = this.formBuilder.group({
      to_date: [],
      from_date: [],
      percentage_retention: [],
      id: [],
    });
    this.ranges.push(rangesFormGroup);
  }

  save(): void {
    if (!this.myForm.valid) {
      return;
    }

    const walletWithdrawalsConfig: WalletWithdrawalsConfiguration = this.buildWalletWalletWithdrawalsConfig();

    const walletPeriodRequests: WalletPeriod[] = this.datePickers.controls.map(
      this.buildWalletPeriodRequest
    );

    const walletRetentionConfig: WalletRetentionConfig[] = this.ranges.controls.map(
      (control) => this.buildWalletRetentionConfig(control)
    );

    forkJoin([
      this.walletPeriodService.createWalletPeriod(walletPeriodRequests),
      this.walletRetentionConfigService.createWalletRetentionConfig(walletRetentionConfig),
      this.configurationService.createWithdrawalsWalletConfiguration(walletWithdrawalsConfig)
    ]).subscribe({
      next: () => {
        this.showSuccess('The wallet period and wallet retention were updated successfully!');
        this.loadWalletPeriod();
        this.loadWalletRetentionConf();
      },
      error: () => {
        this.showError('Error!');
      },
    });
  }

  saveAdditionalParameters() {
    const additionalParametersConfig: AdditionalParametersConfiguration = this.buildAdditionalParametersConfig();

    this.configurationService.createAdditionalParametersWalletConfiguration(additionalParametersConfig).subscribe({
      next: () => {
        this.showSuccess('The wallet parameters was updated successfully!');
        this.loadAdditionalParametersConfiguration();
      },
      error: () => {
        this.showError('Error!');
      },
    })
  }

  removeDatepicker(index: number) {
    this.datePickers.removeAt(index);
    if (index != null) {
      this.walletPeriodService.delete(index).subscribe({
        next: (resp) => {
          if (resp.success) {
            this.showSuccess('The wallet period was deleted successfully!');
            this.loadWalletPeriod();
          }
        },
        error: () => {
          this.showError('Error!');
        },
      });
    }
  }

  removeRange(index: number) {
    this.ranges.removeAt(index);
    if (index != null) {
      this.walletRetentionConfigService.delete(index).subscribe({
        next: () => {
          this.showSuccess('The wallet retention was deleted successfully!');
          this.loadWalletRetentionConf();
        },
        error: () => {
          this.showError('Error!');
        },
      });
    }
  }

  private buildWalletWalletWithdrawalsConfig(): WalletWithdrawalsConfiguration {
    const walletWithdrawalsConfig = new WalletWithdrawalsConfiguration();
    walletWithdrawalsConfig.minimum_amount = this.myForm.value.minimum_amount;
    walletWithdrawalsConfig.commission_amount = this.myForm.value.commission_amount;
    walletWithdrawalsConfig.maximum_amount = this.myForm.value.maximum_amount;
    walletWithdrawalsConfig.activate_invoice_cancellation = this.myForm.value.activate_invoice_cancellation;
    return walletWithdrawalsConfig;
  }

  private buildWalletPeriodRequest(control: AbstractControl): WalletPeriod {
    const pickerValue = control.get('picker').value;
    const dateString = `${pickerValue.year}-${pickerValue.month}-${pickerValue.day}`;
    const formattedDate = formatDate(dateString, 'yyyy-MM-dd', 'en-US');
    const dateObject = new Date(formattedDate);

    const walletPeriodRequest = new WalletPeriod();
    walletPeriodRequest.id = Number(control.value.id);

    if (
      Number.isNaN(walletPeriodRequest.id) ||
      walletPeriodRequest.id == null
    ) {
      walletPeriodRequest.id = 0;
    }

    walletPeriodRequest.date = dateObject;

    return walletPeriodRequest;
  }

  private buildWalletRetentionConfig(
    control: AbstractControl
  ): WalletRetentionConfig {
    const toDateValue = control.get('to_date').value;
    const fromDateValue = control.get('from_date').value;
    const percentageRetentionValue = control.get('percentage_retention').value;

    const walletRetentionConfig = new WalletRetentionConfig();

    walletRetentionConfig.withdrawalTo = toDateValue;
    walletRetentionConfig.withdrawalFrom = fromDateValue;
    walletRetentionConfig.percentage = percentageRetentionValue;
    walletRetentionConfig.id = Number(control.value.id);

    if (
      Number.isNaN(walletRetentionConfig.id) ||
      walletRetentionConfig.id == null
    ) {
      walletRetentionConfig.id = 0;
    }

    return walletRetentionConfig;
  }

  private buildAdditionalParametersConfig(): AdditionalParametersConfiguration {
    const additionalParametersConfiguration = new AdditionalParametersConfiguration();

    additionalParametersConfiguration.activate_confirmation_mails = this.additionalParameters.value.activate_confirmation_mails;
    additionalParametersConfiguration.concept_wallet_withdrawal = this.additionalParameters.value.concept_wallet_withdrawal;
    additionalParametersConfiguration.minutes_validity_code = this.additionalParameters.value.minutes_validity_code;

    return additionalParametersConfiguration;
  }
}
