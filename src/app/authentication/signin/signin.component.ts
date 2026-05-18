import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Response } from '@app/core/models/response-model/response.model';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/service/authentication-service/auth.service';
import { CommonModule } from '@angular/common';

import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Signin } from '@app/core/models/signin-model/signin.model';
import { LogoService } from '@app/core/service/logo-service/logo.service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  animations: [
    trigger('backgroundFade', [
      state(
        'visible',
        style({
          opacity: 1,
        }),
      ),
      state(
        'hidden',
        style({
          opacity: 0,
        }),
      ),
      transition('visible => hidden', animate('1000ms ease-out')),
      transition('hidden => visible', animate('1000ms ease-in')),
    ]),
  ],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
})
export class SigninComponent implements OnInit, OnDestroy {
  submitted = false;
  error = '';
  loading = false;
  hide = true;
  logoUrl: string;
  username: string = 'Usuario';
  password: string = 'Contraseña';
  remember: string = 'Recordar';
  forgot: string = 'Cambiar contraseña';
  signin: string = 'Iniciar sesión';
  passwordIsRequerid = 'La contraseña es requerida.';
  userNameIsRequerid = 'El usuario es requerido.';
  passwordErrorMessage =
    'La contraseña debe tener al menos 6 y un máximo de 15 caracteres';
  userNameErrorMessage = 'El nombre de usuario no es válido';
  backgroundImages: string[] = [
    '/assets/images/login-option-1.png',
    '/assets/images/login-option-2.png',
    '/assets/images/login-option-3.png',
  ];
  currentImageIndex = 0;
  private intervalId: any;
  showPassword: boolean = false;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly toastr: ToastrService,
    private readonly logoService: LogoService,
    private readonly translate: TranslateService,
    private readonly deviceService: DeviceDetectorService,
  ) {}

  ngOnInit() {
    // Verificar si el usuario ya está logueado usando signals
    if (this.authService.isLoggedIn()) {
      // Redirigir según el tipo de usuario
      if (this.authService.isAffiliateLoggedIn()) {
        this.router.navigate(['/app/home']);
      } else if (this.authService.isAdminLoggedIn()) {
        this.router.navigate(['/admin/home-admin']);
      }
      return;
    }

    this.getTheme();
    this.setLabels();
    this.setErrorMessages();
    this.startBackgroundRotation();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  authLogin = new FormGroup({
    remeber: new FormControl('', []),
    email: new FormControl('', [Validators.required]),
    pwd: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(15),
    ]),
  });

  setLabels() {
    if (this.translate.getCurrentLang() != undefined) {
      this.username = this.translate.instant('SIGNIN.USER-NAME.TEXT');
      this.password = this.translate.instant('SIGNIN.PASSWORD.TEXT');
      this.remember = this.translate.instant('SIGNIN.REMEMBER-ME.TEXT');
      this.forgot = this.translate.instant('SIGNIN.FORGOT-PASS.TEXT');
      this.signin = this.translate.instant('SIGNIN.TITLE.TEXT');
    }
  }

  setErrorMessages() {
    if (this.translate.getCurrentLang() != undefined) {
      this.passwordIsRequerid = this.translate.instant(
        'SIGNIN.PASS-IS-REQUIRED.TEXT',
      );
      this.userNameIsRequerid = this.translate.instant(
        'SIGNIN.USER-NAME-IS-REQUIRED.TEXT',
      );
      this.passwordErrorMessage = this.translate.instant(
        'SIGNIN.PASS-MESSAGE-ERROR.TEXT',
      );
      this.userNameErrorMessage = this.translate.instant(
        'SIGNIN.USER-NAME-MESSAGE-ERROR.TEXT',
      );
    }
  }

  loginSubmitted() {
    let signin = new Signin();
    this.submitted = true;
    this.error = '';
    signin.userName = this.authLogin.value.email;
    signin.password = this.authLogin.value.pwd;

    signin.browserInfo = this.deviceService.getDeviceInfo().browser;
    signin.operatingSystem = this.deviceService.getDeviceInfo().os;

    this.authService.fetchIpAddress().subscribe(ip => {
      signin.ipAddress = ip;
      console.log(signin);

      if (signin.userName === '' || signin.password === '') {
        return;
      }
      this.loading = true;

      this.authService.loginUser(signin).subscribe((response: Response) => {
        if (response.success) {
          if (response.data.is_affiliate) {
            this.router.navigate(['/app/home']).then();
          } else {
            this.router.navigate(['admin/home-admin']).then();
          }
        } else {
          this.showError(response.message);
        }
        this.loading = false;
      });
    });
  }

  googleLoginSubmitted() {
    const deviceInfo = this.deviceService.getDeviceInfo();
    this.loading = true;

    this.authService.fetchIpAddress().subscribe(ip => {
      this.authService
        .loginWithGoogle({
          browserInfo: deviceInfo.browser,
          operatingSystem: deviceInfo.os,
          ipAddress: ip,
        })
        .subscribe({
          next: (response: Response) => {
            if (response.success) {
              if (response.data.is_affiliate) {
                this.router.navigate(['/app/home']).then();
              } else {
                this.router.navigate(['admin/home-admin']).then();
              }
            } else {
              this.showError(response.message);
            }
            this.loading = false;
          },
          error: () => {
            this.showError('No fue posible iniciar sesión con Google.');
            this.loading = false;
          },
        });
    });
  }

  showSuccess(message: string) {
    this.toastr.success(message, 'Success!');
  }

  showError(message: string) {
    this.toastr.error(message, 'Error!');
  }

  get f() {
    return this.authLogin.controls;
  }

  get Email(): FormControl {
    return this.authLogin.get('email') as FormControl;
  }

  get Pwd(): FormControl {
    return this.authLogin.get('pwd') as FormControl;
  }

  getTheme() {
    this.logoUrl = this.logoService.getLogoSrc();
  }

  private startBackgroundRotation() {
    this.intervalId = setInterval(() => {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.backgroundImages.length;
    }, 10000);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
