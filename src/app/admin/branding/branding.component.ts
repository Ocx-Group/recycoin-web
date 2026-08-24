import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';

import {
  BrandingAdministration,
  UpdateOwnBrandingRequest,
} from '@app/core/models/branding-model/branding-administration.model';
import { BrandingAdministrationService } from '@app/core/service/branding-service/branding-administration.service';
import { BrandingService } from '@app/core/service/branding-service/branding.service';
import { ObjectStorageService } from '@app/core/service/object-storage-service/object-storage.service';

/** Matches the `[Phone]` data annotation applied to `SupportPhone` on the server. */
const PHONE_PATTERN = /^\+?[0-9(][0-9\s().-]{4,}$/;
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
const HTTP_URL_PATTERN = /^https?:\/\/.+/i;
const OPTIONAL_HTTP_URL_PATTERN = /^(https?:\/\/.+)?$/i;
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

@Component({
  selector: 'app-branding',
  templateUrl: './branding.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
})
export class BrandingComponent implements OnInit {
  brandingForm: FormGroup;
  loading = false;
  saving = false;
  uploadingLogo = false;
  currentBrandId: number | null = null;
  updatedAt: string | null = null;
  logoPreviewFailed = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly brandingAdministrationService: BrandingAdministrationService,
    private readonly brandingService: BrandingService,
    private readonly objectStorageService: ObjectStorageService,
    private readonly toastrService: ToastrService,
    private readonly translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.brandingForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      companyName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      companyIdentifier: ['', Validators.maxLength(100)],
      clientUrl: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(HTTP_URL_PATTERN)]],
      supportEmail: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
      supportPhone: ['', [Validators.maxLength(50), Validators.pattern(PHONE_PATTERN)]],
      documentType: ['', Validators.maxLength(50)],
      logoUrl: ['', [Validators.maxLength(1000), Validators.pattern(OPTIONAL_HTTP_URL_PATTERN)]],
      primaryColor: ['#000000', [Validators.required, Validators.pattern(HEX_COLOR_PATTERN)]],
      secondaryColor: ['#FFFFFF', [Validators.required, Validators.pattern(HEX_COLOR_PATTERN)]],
      backgroundColor: ['#FFFFFF', [Validators.required, Validators.pattern(HEX_COLOR_PATTERN)]],
    });

    this.load();
  }

  control(name: string): AbstractControl | null {
    return this.brandingForm.get(name);
  }

  showsError(name: string): boolean {
    const control = this.control(name);
    return !!control && control.touched && control.invalid;
  }

  serverError(name: string): string | null {
    return this.control(name)?.getError('server') ?? null;
  }

  load(): void {
    this.loading = true;
    this.brandingAdministrationService.getCurrent()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: branding => this.applyLoaded(branding),
        error: error => this.reportError(error, 'BRANDING-PAGE.ERR-LOAD.TEXT'),
      });
  }

  save(): void {
    this.clearServerErrors();
    this.brandingForm.markAllAsTouched();
    if (this.brandingForm.invalid || this.saving || this.uploadingLogo) return;

    const value = this.brandingForm.getRawValue();
    const request: UpdateOwnBrandingRequest = {
      name: value.name.trim(),
      companyName: value.companyName.trim(),
      companyIdentifier: this.optional(value.companyIdentifier),
      clientUrl: value.clientUrl.trim(),
      supportEmail: value.supportEmail.trim(),
      supportPhone: this.optional(value.supportPhone),
      documentType: this.optional(value.documentType),
      logoUrl: this.optional(value.logoUrl),
      primaryColor: value.primaryColor.toUpperCase(),
      secondaryColor: value.secondaryColor.toUpperCase(),
      backgroundColor: value.backgroundColor.toUpperCase(),
    };

    this.saving = true;
    this.brandingAdministrationService.updateCurrent(request)
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: branding => {
          this.applyLoaded(branding);
          // The dashboard is itself a page of this brand, so the new identity is
          // applied immediately instead of waiting for the next full reload.
          this.brandingService.applyAdministrativeUpdate(branding);
          this.toastrService.success(
            this.translate.instant('BRANDING-PAGE.OK-SAVE.TEXT'));
        },
        error: error => this.reportError(error, 'BRANDING-PAGE.ERR-SAVE.TEXT'),
      });
  }

  uploadLogo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';

    if (!file.type.startsWith('image/')) {
      this.toastrService.error(this.translate.instant('BRANDING-PAGE.ERR-LOGO-TYPE.TEXT'));
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      this.toastrService.error(this.translate.instant('BRANDING-PAGE.ERR-LOGO-SIZE.TEXT'));
      return;
    }

    this.uploadingLogo = true;
    this.objectStorageService
      .uploadAccountImage(file, 'branding', this.logoFileName(file))
      .pipe(finalize(() => this.uploadingLogo = false))
      .subscribe({
        next: url => {
          this.logoPreviewFailed = false;
          this.brandingForm.patchValue({ logoUrl: url });
          this.brandingForm.get('logoUrl')?.markAsDirty();
          this.toastrService.success(this.translate.instant('BRANDING-PAGE.OK-LOGO.TEXT'));
        },
        error: () => this.toastrService.error(
          this.translate.instant('BRANDING-PAGE.ERR-LOGO-UPLOAD.TEXT')),
      });
  }

  onLogoPreviewError(): void {
    this.logoPreviewFailed = true;
  }

  onLogoUrlInput(): void {
    this.logoPreviewFailed = false;
  }

  private applyLoaded(branding: BrandingAdministration): void {
    this.currentBrandId = branding.brandId;
    this.updatedAt = branding.updatedAt;
    this.logoPreviewFailed = false;
    this.brandingForm.patchValue(branding);
  }

  private logoFileName(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
    return `brand-${this.currentBrandId ?? 'current'}-${Date.now()}.${extension}`;
  }

  private optional(value: string | null | undefined): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private clearServerErrors(): void {
    Object.keys(this.brandingForm.controls).forEach(name => {
      const control = this.brandingForm.get(name);
      if (control?.hasError('server')) control.setErrors(null);
    });
  }

  /**
   * ConfigurationService answers with three different shapes: the camelCase
   * `{success, message}` envelope, the PascalCase variant produced by
   * `ExceptionMiddleware`, and the stock `ValidationProblemDetails` emitted by
   * `[ApiController]` for data annotation failures. Reading only one of them was
   * turning every rejection into the same generic message.
   */
  private reportError(error: any, fallbackKey: string): void {
    if (error?.message === 'ADMIN_TOKEN_REQUIRED' || error?.status === 401) {
      this.toastrService.error(this.translate.instant('BRANDING-PAGE.ERR-SESSION.TEXT'));
      return;
    }

    if (error?.status === 403) {
      this.toastrService.error(this.translate.instant('BRANDING-PAGE.ERR-FORBIDDEN.TEXT'));
      return;
    }

    if (error?.status === 409) {
      const message = this.translate.instant('BRANDING-PAGE.ERR-CONFLICT.TEXT');
      this.setServerError('clientUrl', message);
      this.toastrService.error(message);
      return;
    }

    const fieldErrors = error?.error?.errors;
    if (fieldErrors && typeof fieldErrors === 'object') {
      const messages = this.applyFieldErrors(fieldErrors);
      this.toastrService.error(
        messages[0] || this.translate.instant(fallbackKey));
      return;
    }

    const body = error?.error;
    const message = body?.message || body?.Message;
    this.toastrService.error(message || this.translate.instant(fallbackKey));
  }

  private applyFieldErrors(fieldErrors: Record<string, unknown>): string[] {
    const messages: string[] = [];

    Object.keys(fieldErrors).forEach(key => {
      const detail = Array.isArray(fieldErrors[key])
        ? String((fieldErrors[key] as unknown[])[0])
        : String(fieldErrors[key]);
      messages.push(detail);
      // The server reports PascalCase member names; controls are camelCase.
      this.setServerError(key.charAt(0).toLowerCase() + key.slice(1), detail);
    });

    return messages;
  }

  private setServerError(controlName: string, message: string): void {
    const control = this.brandingForm.get(controlName);
    if (!control) return;

    control.setErrors({ ...(control.errors || {}), server: message });
    control.markAsTouched();
  }
}
