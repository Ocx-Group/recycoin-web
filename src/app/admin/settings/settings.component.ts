import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {ConfigurationService} from "../../core/service/configuration-service/configuration.service";
import {GeneralConfiguration} from "../../core/models/general-configuration/general-configuration.model";
import {NgbNav, NgbNavContent, NgbNavItem, NgbNavLink, NgbNavOutlet} from "@ng-bootstrap/ng-bootstrap";


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
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
  // The remaining tabs are placeholders that already bind this group. Without it
  // they throw as soon as they are opened.
  additionalParameters: FormGroup;
  active = 1;

  constructor(
    private fb: FormBuilder,
    private configurationService: ConfigurationService,
    private toastrService: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.generalConfigurationForm = this.fb.group({
      paymentModelCutoffDate: ['', Validators.required],
      isUnderMaintenance: [false]
    });

    this.additionalParameters = this.fb.group({});

    this.loadGeneralConfiguration();
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
          // El subscribe llega fuera de todo evento: con OnPush hay que marcar.
          this.cdr.markForCheck();
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

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
