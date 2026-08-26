import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

import {
  COMMISSION_MAX_LEVELS,
  COMMISSION_MAX_TOTAL_PERCENTAGE,
  CommissionSettings,
  UpdateCommissionSettingsRequest,
} from '@app/core/models/commission-settings-model/commission-settings.model';
import { CommissionSettingsService } from '@app/core/service/commission-settings-service/commission-settings.service';

@Component({
  selector: 'app-commissions-configuration',
  templateUrl: './commissions-configuration.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
})
export class CommissionsConfigurationComponent implements OnInit {
  commissionsForm: FormGroup;
  loading = false;
  saving = false;
  currentBrandId: number | null = null;
  updatedAt: string | null = null;

  readonly maxLevels = COMMISSION_MAX_LEVELS;
  readonly maxTotal = COMMISSION_MAX_TOTAL_PERCENTAGE;

  constructor(
    private readonly fb: FormBuilder,
    private readonly commissionSettingsService: CommissionSettingsService,
    private readonly toastrService: ToastrService,
    private readonly translate: TranslateService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.commissionsForm = this.fb.group(
      {
        commissionEnabled: [false],
        dailyBonusAlwaysDistribute: [false],
        commissionLevels: this.fb.array([]),
      },
      { validators: [levelsConsistencyValidator] },
    );

    this.load();
  }

  get levels(): FormArray {
    return this.commissionsForm.get('commissionLevels') as FormArray;
  }

  get isEnabled(): boolean {
    return !!this.commissionsForm.get('commissionEnabled')?.value;
  }

  /** Live total so the operator sees the payout adding up while editing. */
  get totalPercentage(): number {
    const sum = this.levels.controls.reduce(
      (accumulated, control) => accumulated + toPercentage(control.value), 0);
    // Percentages carry two decimals; the sum of floats needs rounding to avoid
    // showing 20.000000000000004.
    return Math.round(sum * 100) / 100;
  }

  get canAddLevel(): boolean {
    return this.levels.length < this.maxLevels;
  }

  formError(name: string): boolean {
    return !!this.commissionsForm.errors?.[name] && this.commissionsForm.touched;
  }

  levelHasError(index: number): boolean {
    const control = this.levels.at(index);
    return control.touched && control.invalid;
  }

  addLevel(): void {
    if (!this.canAddLevel) return;
    this.levels.push(this.buildLevelControl(0));
    this.commissionsForm.markAsDirty();
  }

  removeLevel(index: number): void {
    Swal.fire({
      title: this.translate.instant('COMMISSIONS-CONFIGURATION-PAGE.CONFIRM-REMOVE.TEXT'),
      text: this.translate.instant('COMMISSIONS-CONFIGURATION-PAGE.CONFIRM-REMOVE-DETAIL.TEXT'),
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMISSIONS-CONFIGURATION-PAGE.CONFIRM-YES.TEXT'),
    }).then(result => {
      if (!result.value) return;
      this.levels.removeAt(index);
      this.commissionsForm.markAsDirty();
    });
  }

  load(): void {
    this.loading = true;
    this.commissionSettingsService.getCurrent()
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: settings => this.applyLoaded(settings),
        error: error => this.reportError(error, 'COMMISSIONS-CONFIGURATION-PAGE.ERR-LOAD.TEXT'),
      });
  }

  save(): void {
    this.commissionsForm.markAllAsTouched();
    if (this.commissionsForm.invalid || this.saving) return;

    const request: UpdateCommissionSettingsRequest = {
      commissionEnabled: this.isEnabled,
      dailyBonusAlwaysDistribute: !!this.commissionsForm.get('dailyBonusAlwaysDistribute')?.value,
      commissionLevels: this.levels.controls.map(control => toPercentage(control.value)),
    };

    this.saving = true;
    this.commissionSettingsService.updateCurrent(request)
      .pipe(finalize(() => { this.saving = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: settings => {
          this.applyLoaded(settings);
          this.toastrService.success(
            this.translate.instant('COMMISSIONS-CONFIGURATION-PAGE.OK-SAVE.TEXT'));
        },
        error: error => this.reportError(error, 'COMMISSIONS-CONFIGURATION-PAGE.ERR-SAVE.TEXT'),
      });
  }

  private applyLoaded(settings: CommissionSettings): void {
    this.currentBrandId = settings.brandId;
    this.updatedAt = settings.updatedAt;

    this.commissionsForm.patchValue({
      commissionEnabled: settings.commissionEnabled,
      dailyBonusAlwaysDistribute: settings.dailyBonusAlwaysDistribute,
    }, { emitEvent: false });

    this.levels.clear();
    (settings.commissionLevels || [])
      .slice(0, this.maxLevels)
      .forEach(percentage => this.levels.push(this.buildLevelControl(percentage)));

    this.commissionsForm.markAsPristine();
    this.commissionsForm.updateValueAndValidity();
  }

  private buildLevelControl(percentage: number) {
    return this.fb.control(percentage, [
      Validators.required,
      Validators.min(0),
      Validators.max(100),
    ]);
  }

  /**
   * ConfigurationService answers with the camelCase `{success, message}` envelope,
   * the PascalCase variant produced by `ExceptionMiddleware`, or the stock
   * `ValidationProblemDetails` from `[ApiController]`. Reading only one of them
   * would flatten every rejection into the same generic message.
   */
  private reportError(error: any, fallbackKey: string): void {
    if (error?.message === 'ADMIN_TOKEN_REQUIRED' || error?.status === 401) {
      this.toastrService.error(
        this.translate.instant('COMMISSIONS-CONFIGURATION-PAGE.ERR-SESSION.TEXT'));
      return;
    }

    if (error?.status === 403) {
      this.toastrService.error(
        this.translate.instant('COMMISSIONS-CONFIGURATION-PAGE.ERR-FORBIDDEN.TEXT'));
      return;
    }

    const fieldErrors = error?.error?.errors;
    if (fieldErrors && typeof fieldErrors === 'object') {
      const first = Object.keys(fieldErrors)
        .map(key => Array.isArray(fieldErrors[key])
          ? String(fieldErrors[key][0])
          : String(fieldErrors[key]))[0];
      this.toastrService.error(first || this.translate.instant(fallbackKey));
      return;
    }

    const body = error?.error;
    const message = body?.message || body?.Message;
    this.toastrService.error(message || this.translate.instant(fallbackKey));
  }
}

/** Empty inputs must not silently count as 0% of a real payout. */
function toPercentage(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Mirrors the server rules in `UpdateOwnCommissionSettingsHandler.Validate` so the
 * operator is told before the request leaves the browser.
 */
function levelsConsistencyValidator(group: AbstractControl): ValidationErrors | null {
  const enabled = !!group.get('commissionEnabled')?.value;
  const levels = group.get('commissionLevels') as FormArray | null;
  if (!levels) return null;

  if (enabled && levels.length === 0) {
    return { levelsRequired: true };
  }

  const total = levels.controls.reduce(
    (accumulated, control) => accumulated + toPercentage(control.value), 0);

  if (Math.round(total * 100) / 100 > COMMISSION_MAX_TOTAL_PERCENTAGE) {
    return { totalExceeded: true };
  }

  return null;
}
