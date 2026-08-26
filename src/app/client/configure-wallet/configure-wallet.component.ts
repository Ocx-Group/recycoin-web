import { AddressBtc } from '@app/core/models/affiliate-btc-model/address-btc.model';
import { AffiliateBtc } from '@app/core/models/affiliate-btc-model/affiliate-btc.model';
import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { AffiliateBtcService } from '@app/core/service/affiliate-btc-service/affiliate-btc.service';
import { AffiliateService } from '@app/core/service/affiliate-service/affiliate.service';
import { AuthService } from '@app/core/service/authentication-service/auth.service';
import { ConfigureWalletService } from '@app/core/service/configure-wallet-service/configure-wallet.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-configure-wallet',
    templateUrl: './configure-wallet.component.html',
    styleUrls: ['./configure-wallet.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, ReactiveFormsModule]
})
export class ConfigureWalletComponent implements OnInit, AfterViewInit, OnDestroy {
  currentStep: number = 1;
  walletForm: FormGroup;
  user: UserAffiliate = new UserAffiliate();
  affiliateBtc: AffiliateBtc = new AffiliateBtc();
  private subscriptionOpenedModal = new Subscription();
  @ViewChild('configureWalletModal') configureWalletModal: TemplateRef<any>;

  constructor(
    private formBuilder: FormBuilder,
    private configureWalletService: ConfigureWalletService,
    private authService: AuthService,
    private affiliateBtcService: AffiliateBtcService,
    private toastr: ToastrService,
    private affiliateService: AffiliateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.user = this.authService.currentUserAffiliateValue;

    this.subscriptionOpenedModal.add(
      this.configureWalletService.modalOpened$.subscribe(() => {
        this.resetForm();
        this.loadConfiguration();
      })
    );
  }

  ngAfterViewInit() {
    this.configureWalletService.setModalContent(this.configureWalletModal);
  }

  ngOnDestroy(): void {
    this.subscriptionOpenedModal.unsubscribe();
  }

  get formControls(): { [key: string]: AbstractControl } {
    return this.walletForm.controls;
  }

  initForm() {
    this.walletForm = this.formBuilder.group({
      trc_address: ['', Validators.required],
      bnb_address: [''],
      security_code: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  loadConfiguration() {
    this.affiliateBtcService.getAffiliateBtcByAffiliateId(this.user.id).subscribe({
      next: (value) => {
        if (value.success) {
          this.setConfiguration(value.data);
          this.walletForm.markAsPristine();
          // Escribe en el formulario fuera de todo evento: con OnPush hay que marcar.
          this.cdr.markForCheck();
        }
      },
      error: () => {
        this.toastr.error('Error al cargar la configuración');
      },
    });
  }

  setConfiguration(value: AddressBtc[]) {
    const updateWalletAddress: { trc_address?: string; bnb_address?: string } = {};

    value.forEach(item => {
      if (item && typeof item === 'object') {
        if (item.networkId === 56) {
          updateWalletAddress.trc_address = item.address;
        } else if (item.networkId === 202) {
          updateWalletAddress.bnb_address = item.address;
        }
      }
    });

    if (Object.keys(updateWalletAddress).length > 0) {
      this.walletForm.patchValue(updateWalletAddress);
    }
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
      if (this.currentStep === 2) {
        this.generateVerificationCode();
      }
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        const trcValid = this.walletForm.get('trc_address')?.valid ?? false;
        const bnbValid = this.walletForm.get('bnb_address')?.valid ?? false;
        return trcValid || bnbValid;
      case 2:
        return this.walletForm.get('security_code')?.valid ?? false;
      default:
        return false;
    }
  }

  onSubmit() {
    if (this.walletForm.valid) {
      this.saveConfiguration();
    }
  }

  saveConfiguration() {
    this.affiliateBtc.affiliateId = this.user.id;
    this.affiliateBtc.trc20Address = this.walletForm.value.trc_address;
    this.affiliateBtc.bscAddress = this.walletForm.value.bnb_address;
    this.affiliateBtc.verificationCode = this.walletForm.value.security_code;
    this.affiliateBtc.password = this.walletForm.value.password;

    this.affiliateBtcService.createAffiliateBtc(this.affiliateBtc).subscribe({
      next: (value) => {
        if (value.success) {
          this.toastr.success('Configuración de la billetera creada correctamente.');
          this.configureWalletService.closeConfigureWalletModal();
        } else {
          this.toastr.error('Uno de los datos ingresados no corresponde o es incorrecto, revise e inténtelo nuevamente.');
        }
      },
      error: (error) => {
        this.toastr.error('Error al guardar la configuración');
      },
    });
  }

  generateVerificationCode() {
    this.affiliateService.generateVerificationCode(this.user.id, false).subscribe({
      next: (value) => {
        if (value.success) {
          this.toastr.success('Se ha generado un código de seguridad, por favor revisa tu correo electrónico.');
        }
      },
      error: () => {
        this.toastr.error('Error al generar el código de verificación');
      }
    });
  }

  resetForm() {
    this.walletForm.reset();
    this.currentStep = 1;
  }
}
