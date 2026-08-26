import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

import {
  MONTHLY_COMMISSION_MAX_INTEREST_RATE,
  MONTHLY_COMMISSION_MAX_WAITING_DAYS,
  MonthlyCommissionResult,
  MonthlyCommissionSettings,
  UpdateMonthlyCommissionSettingsRequest,
} from '@app/core/models/monthly-commission-model/monthly-commission.model';
import { PaymentGroup } from '@app/core/models/payment-group-model/payment.group.model';
import { MonthlyCommissionService } from '@app/core/service/monthly-commission-service/monthly-commission.service';
import { MonthlyCommissionSettingsService } from '@app/core/service/monthly-commission-service/monthly-commission-settings.service';
import { PaymentGroupsService } from '@app/core/service/payment-groups-service/payment-groups.service';

/**
 * Monthly commission liquidation.
 *
 * Two things live on this screen on purpose. The upper panel edits the brand's own
 * defaults — rate, waiting days and the payment group of the product it liquidates —
 * because those differ per website and used to be hardcoded here. The lower form runs
 * one liquidation, pre-filled from those defaults and overridable for a single run.
 *
 * The brand and the administrator name are never sent: the server derives both from
 * the admin session.
 */
@Component({
  selector: 'app-calculate-commissions',
  templateUrl: './calculate-commissions.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgbAlert, TranslatePipe],
})
export class CalculateCommissionsComponent implements OnInit {
  settingsForm: FormGroup;
  runForm: FormGroup;

  loadingSettings = false;
  savingSettings = false;
  processing = false;

  currentBrandId: number | null = null;
  settingsUpdatedAt: string | null = null;
  paymentGroups: PaymentGroup[] = [];

  /** Result of the last run; drives the preview/outcome table. */
  result: MonthlyCommissionResult | null = null;

  readonly maxInterestRate = MONTHLY_COMMISSION_MAX_INTEREST_RATE;
  readonly maxWaitingDays = MONTHLY_COMMISSION_MAX_WAITING_DAYS;

  readonly months: { value: number; labelKey: string }[] = [
    { value: 1, labelKey: 'CALCULATE-COMMISSIONS.MONTH-1.TEXT' },
    { value: 2, labelKey: 'CALCULATE-COMMISSIONS.MONTH-2.TEXT' },
    { value: 3, labelKey: 'CALCULATE-COMMISSIONS.MONTH-3.TEXT' },
    { value: 4, labelKey: 'CALCULATE-COMMISSIONS.MONTH-4.TEXT' },
    { value: 5, labelKey: 'CALCULATE-COMMISSIONS.MONTH-5.TEXT' },
    { value: 6, labelKey: 'CALCULATE-COMMISSIONS.MONTH-6.TEXT' },
    { value: 7, labelKey: 'CALCULATE-COMMISSIONS.MONTH-7.TEXT' },
    { value: 8, labelKey: 'CALCULATE-COMMISSIONS.MONTH-8.TEXT' },
    { value: 9, labelKey: 'CALCULATE-COMMISSIONS.MONTH-9.TEXT' },
    { value: 10, labelKey: 'CALCULATE-COMMISSIONS.MONTH-10.TEXT' },
    { value: 11, labelKey: 'CALCULATE-COMMISSIONS.MONTH-11.TEXT' },
    { value: 12, labelKey: 'CALCULATE-COMMISSIONS.MONTH-12.TEXT' },
  ];

  startDate = '';
  endDate = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly settingsService: MonthlyCommissionSettingsService,
    private readonly monthlyCommissionService: MonthlyCommissionService,
    private readonly paymentGroupsService: PaymentGroupsService,
    private readonly toastrService: ToastrService,
    private readonly translate: TranslateService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // The last complete month is the only one that can be liquidated, so it is also
    // the sensible default.
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    this.settingsForm = this.fb.group({
      enabled: [false],
      interestRate: [0, [Validators.required, Validators.min(0), Validators.max(this.maxInterestRate)]],
      waitingDays: [0, [Validators.required, Validators.min(0), Validators.max(this.maxWaitingDays)]],
      paymentGroupId: [null as number | null],
    });

    this.runForm = this.fb.group({
      month: [lastMonth.getMonth() + 1, Validators.required],
      year: [lastMonth.getFullYear(), Validators.required],
      interestRate: [0, [Validators.required, Validators.min(0), Validators.max(this.maxInterestRate)]],
      waitingDays: [0, [Validators.required, Validators.min(0), Validators.max(this.maxWaitingDays)]],
      paymentGroupId: [null as number | null, Validators.required],
      dryRun: [true],
    });

    this.updateDateRange();
    this.runForm.get('month')?.valueChanges.subscribe(() => this.updateDateRange());
    this.runForm.get('year')?.valueChanges.subscribe(() => this.updateDateRange());

    this.loadPaymentGroups();
    this.loadSettings();
  }

  get isSimulation(): boolean {
    return !!this.runForm?.get('dryRun')?.value;
  }

  get selectedYear(): number {
    return Number(this.runForm?.get('year')?.value);
  }

  /**
   * A month can only be liquidated once it is over, so anything from the current month
   * onwards is closed off.
   */
  isMonthDisabled(monthValue: number): boolean {
    const today = new Date();
    const lastComplete = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const selectedYear = this.selectedYear;

    if (selectedYear > lastComplete.getFullYear()) return true;
    if (selectedYear < lastComplete.getFullYear()) return false;
    return monthValue > lastComplete.getMonth() + 1;
  }

  loadPaymentGroups(): void {
    this.paymentGroupsService.getAll().subscribe({
      next: groups => {
        this.paymentGroups = (groups as PaymentGroup[]) || [];
        this.cdr.markForCheck();
      },
      // A failure here only costs the operator the friendly names in the dropdown, so
      // it must not block the screen.
      error: () => {
        this.paymentGroups = [];
        this.cdr.markForCheck();
      },
    });
  }

  loadSettings(): void {
    this.loadingSettings = true;
    this.settingsService.getCurrent()
      .pipe(finalize(() => {
        this.loadingSettings = false;
        // finalize corre despues de next y de error, asi que esta marca cubre
        // tambien lo que applySettings deja escrito.
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: settings => this.applySettings(settings),
        error: error => this.reportError(error, 'CALCULATE-COMMISSIONS.ERR-LOAD.TEXT'),
      });
  }

  saveSettings(): void {
    this.settingsForm.markAllAsTouched();
    if (this.settingsForm.invalid || this.savingSettings) return;

    const enabled = !!this.settingsForm.get('enabled')?.value;
    const paymentGroupId = toNullableId(this.settingsForm.get('paymentGroupId')?.value);

    // Mirrors the server rule, so the operator is told before the round trip.
    if (enabled && paymentGroupId === null) {
      this.toastrService.error(
        this.translate.instant('CALCULATE-COMMISSIONS.ERR-GROUP-REQUIRED.TEXT'));
      return;
    }

    const request: UpdateMonthlyCommissionSettingsRequest = {
      enabled,
      interestRate: toNumber(this.settingsForm.get('interestRate')?.value),
      waitingDays: toNumber(this.settingsForm.get('waitingDays')?.value),
      paymentGroupId,
    };

    this.savingSettings = true;
    this.settingsService.updateCurrent(request)
      .pipe(finalize(() => {
        this.savingSettings = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: settings => {
          this.applySettings(settings);
          this.toastrService.success(
            this.translate.instant('CALCULATE-COMMISSIONS.OK-SAVE.TEXT'));
        },
        error: error => this.reportError(error, 'CALCULATE-COMMISSIONS.ERR-SAVE.TEXT'),
      });
  }

  processLiquidation(): void {
    this.runForm.markAllAsTouched();
    if (this.runForm.invalid || this.processing) return;

    const simulation = this.isSimulation;

    Swal.fire({
      title: this.translate.instant('CALCULATE-COMMISSIONS.CONFIRM-TITLE.TEXT'),
      html: this.translate.instant(
        simulation
          ? 'CALCULATE-COMMISSIONS.CONFIRM-SIMULATE.TEXT'
          : 'CALCULATE-COMMISSIONS.CONFIRM-RUN.TEXT',
        {
          startDate: this.startDate,
          endDate: this.endDate,
          rate: toNumber(this.runForm.get('interestRate')?.value),
          days: toNumber(this.runForm.get('waitingDays')?.value),
        }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant(
        simulation
          ? 'CALCULATE-COMMISSIONS.BTN-SIMULATE.TEXT'
          : 'CALCULATE-COMMISSIONS.BTN-RUN.TEXT'),
      cancelButtonText: this.translate.instant('CALCULATE-COMMISSIONS.BTN-CANCEL.TEXT'),
    }).then(confirmation => {
      if (confirmation.isConfirmed) this.executeLiquidation(simulation);
    });
  }

  private executeLiquidation(simulation: boolean): void {
    this.processing = true;
    this.result = null;
    // Se entra aqui desde el .then del Swal de confirmacion, ya fuera del click:
    // sin marcar, el boton no llega a mostrarse en estado ocupado.
    this.cdr.markForCheck();

    Swal.fire({
      title: this.translate.instant('CALCULATE-COMMISSIONS.PROCESSING-TITLE.TEXT'),
      html: this.translate.instant('CALCULATE-COMMISSIONS.PROCESSING-DETAIL.TEXT'),
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    }).then();

    this.monthlyCommissionService.calculate({
      startDate: this.startDate,
      endDate: this.endDate,
      interestRate: toNumber(this.runForm.get('interestRate')?.value),
      waitingDays: toNumber(this.runForm.get('waitingDays')?.value),
      paymentGroupId: toNullableId(this.runForm.get('paymentGroupId')?.value) ?? undefined,
      dryRun: simulation,
    })
      .pipe(finalize(() => {
        this.processing = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: result => {
          this.result = result;
          Swal.close();

          // Zero rows is a legitimate outcome — nobody qualified, or the period was
          // already liquidated — and reporting it as success would read as if money
          // had moved.
          if (result.rowsAffected === 0) {
            this.toastrService.info(
              this.translate.instant('CALCULATE-COMMISSIONS.OK-EMPTY.TEXT'));
            return;
          }

          this.toastrService.success(this.translate.instant(
            result.dryRun
              ? 'CALCULATE-COMMISSIONS.OK-SIMULATED.TEXT'
              : 'CALCULATE-COMMISSIONS.OK-LIQUIDATED.TEXT',
            { count: result.rowsAffected, total: result.totalCredit }));
        },
        error: error => {
          Swal.close();
          this.reportError(error, 'CALCULATE-COMMISSIONS.ERR-RUN.TEXT');
        },
      });
  }

  private applySettings(settings: MonthlyCommissionSettings): void {
    this.currentBrandId = settings.brandId;
    this.settingsUpdatedAt = settings.updatedAt;

    this.settingsForm.patchValue({
      enabled: settings.enabled,
      interestRate: settings.interestRate,
      waitingDays: settings.waitingDays,
      paymentGroupId: settings.paymentGroupId,
    }, { emitEvent: false });
    this.settingsForm.markAsPristine();

    // The run form starts from the saved defaults; the operator can still override
    // them for a single liquidation without changing what the brand has configured.
    this.runForm.patchValue({
      interestRate: settings.interestRate,
      waitingDays: settings.waitingDays,
      paymentGroupId: settings.paymentGroupId,
    }, { emitEvent: false });
  }

  private updateDateRange(): void {
    const year = Number(this.runForm.get('year')?.value);
    const month = Number(this.runForm.get('month')?.value);

    this.startDate = formatDate(new Date(year, month - 1, 1));
    // Day 0 of the next month is the last day of this one.
    this.endDate = formatDate(new Date(year, month, 0));
  }

  paymentGroupName(id: number | null): string {
    if (id === null) return '';
    const group = this.paymentGroups.find(candidate => candidate.id === id);
    return group ? group.name : String(id);
  }

  /**
   * The server answers with the camelCase `{success, message}` envelope, the
   * PascalCase variant produced by `ExceptionMiddleware`, or the stock
   * `ValidationProblemDetails` from `[ApiController]`. Reading only one of them would
   * flatten every rejection into the same generic message.
   */
  private reportError(error: any, fallbackKey: string): void {
    if (error?.message === 'ADMIN_TOKEN_REQUIRED' || error?.status === 401) {
      this.toastrService.error(
        this.translate.instant('CALCULATE-COMMISSIONS.ERR-SESSION.TEXT'));
      return;
    }

    if (error?.status === 403) {
      this.toastrService.error(
        this.translate.instant('CALCULATE-COMMISSIONS.ERR-FORBIDDEN.TEXT'));
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

/** Empty inputs must not silently count as 0 in a real payout. */
function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** The select yields '' for "none" and strings for real ids. */
function toNullableId(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
