import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {ConfigurationService} from "../../core/service/configuration-service/configuration.service";
import {GeneralConfiguration} from "../../core/models/general-configuration/general-configuration.model";
import {NgbNav, NgbNavContent, NgbNavItem, NgbNavLink, NgbNavOutlet} from "@ng-bootstrap/ng-bootstrap";
import {CommonModule} from '@angular/common';
import {finalize} from 'rxjs/operators';
import {UpdateOwnBrandingRequest} from '../../core/models/branding-model/branding-administration.model';
import {BrandingAdministrationService} from '../../core/service/branding-service/branding-administration.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  standalone: true,
  imports: [
    CommonModule,
    NgbNav,
    NgbNavItem,
    NgbNavContent,
    NgbNavLink,
    ReactiveFormsModule,
    NgbNavOutlet
  ]
})
export class SettingsComponent implements OnInit {
  generalConfigurationForm: FormGroup;
  brandingForm: FormGroup;
  active = 1;
  loadingBranding = false;
  savingBranding = false;
  currentBrandId: number | null = null;
  brandingUpdatedAt: string | null = null;

  constructor(
    private fb: FormBuilder,
    private configurationService: ConfigurationService,
    private brandingAdministrationService: BrandingAdministrationService,
    private toastrService: ToastrService,
  ) {
  }

  ngOnInit(): void {
    this.generalConfigurationForm = this.fb.group({
      paymentModelCutoffDate: ['', Validators.required],
      isUnderMaintenance: [false]
    });

    this.brandingForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      companyName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      companyIdentifier: ['', Validators.maxLength(100)],
      clientUrl: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(/^https?:\/\/.+/i)]],
      supportEmail: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
      supportPhone: ['', Validators.maxLength(50)],
      documentType: ['', Validators.maxLength(50)],
      logoUrl: ['', [Validators.maxLength(1000), Validators.pattern(/^(https?:\/\/.+)?$/i)]],
      primaryColor: ['#000000', [Validators.required, Validators.pattern(/^#[0-9a-fA-F]{6}$/)]],
      secondaryColor: ['#FFFFFF', [Validators.required, Validators.pattern(/^#[0-9a-fA-F]{6}$/)]],
      backgroundColor: ['#FFFFFF', [Validators.required, Validators.pattern(/^#[0-9a-fA-F]{6}$/)]],
    });

    this.loadGeneralConfiguration();
    this.loadBranding();
  }

  loadGeneralConfiguration() {
    this.configurationService.getGeneralConfiguration().subscribe({
      next: (value) => {
        if (value.success) {
          const config: GeneralConfiguration = value.data;
          this.generalConfigurationForm.patchValue({
            paymentModelCutoffDate: this.formatDateForInput(new Date(config.paymentModelCutoffDate)),
            isUnderMaintenance: config.isUnderMaintenance
          });
        } else {
          console.error('Error al cargar la configuración general')
        }

      }, error: (err) => {
        console.error('Error', err)
      },
    })
  }

  saveGeneralConfiguration() {
    if (this.generalConfigurationForm.valid) {
      const formValue = this.generalConfigurationForm.value;
      const generalConfiguration = new GeneralConfiguration();
      generalConfiguration.paymentModelCutoffDate = new Date(formValue.paymentModelCutoffDate);
      generalConfiguration.isUnderMaintenance = formValue.isUnderMaintenance;

      this.configurationService.setGeneralConfiguration(generalConfiguration).subscribe({
        next: (value) => {
          if (value.success) {
            this.toastrService.success('Configuración se actualizó correctamente.')
          } else {
            this.toastrService.error('No se pudo actualizar la configuración.')
          }
        }, error: (err) => {
          console.error('Error', err)
        },
      })
    }
  }

  loadBranding(): void {
    this.loadingBranding = true;
    this.brandingAdministrationService.getCurrent()
      .pipe(finalize(() => this.loadingBranding = false))
      .subscribe({
        next: branding => {
          this.currentBrandId = branding.brandId;
          this.brandingUpdatedAt = branding.updatedAt;
          this.brandingForm.patchValue(branding);
        },
        error: error => this.showBrandingError(error, 'No se pudo cargar la identidad de marca.'),
      });
  }

  saveBranding(): void {
    this.brandingForm.markAllAsTouched();
    if (this.brandingForm.invalid || this.savingBranding) return;

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

    this.savingBranding = true;
    this.brandingAdministrationService.updateCurrent(request)
      .pipe(finalize(() => this.savingBranding = false))
      .subscribe({
        next: branding => {
          this.currentBrandId = branding.brandId;
          this.brandingUpdatedAt = branding.updatedAt;
          this.brandingForm.patchValue(branding);
          this.toastrService.success('La identidad de marca se actualizó correctamente.');
        },
        error: error => this.showBrandingError(error, 'No se pudo actualizar la identidad de marca.'),
      });
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private optional(value: string | null | undefined): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private showBrandingError(error: any, fallback: string): void {
    if (error?.message === 'ADMIN_TOKEN_REQUIRED' || error?.status === 401) {
      this.toastrService.error('La sesión administrativa expiró. Cierre sesión e ingrese nuevamente.');
      return;
    }
    if (error?.status === 403) {
      this.toastrService.error('El usuario actual no tiene permiso para editar la marca.');
      return;
    }
    this.toastrService.error(error?.error?.message || fallback);
  }
}
