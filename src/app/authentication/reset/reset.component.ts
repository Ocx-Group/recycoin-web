import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, take, timer } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
declare let particlesJS: any;

import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { AffiliateService } from '@app/core/service/affiliate-service/affiliate.service';
import { RequestResetPassword } from '@app/core/models/user-affiliate-model/request-reset-password-model';

@Component({
    selector: 'app-reset',
    templateUrl: './reset.component.html',
    styleUrls: ['./reset.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonModule, ReactiveFormsModule]
})
export class ResetComponent implements OnInit {
  resetPassword: FormGroup;
  submitted = false;
  verificationCode: string;
  public user: UserAffiliate = new UserAffiliate();
  isLoading: boolean = true;
  linkValid: boolean = false;

  constructor(
    private affiliateService: AffiliateService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    this.verificationCode =
      this.activatedRoute.snapshot.params.verificationCode;
    if (!this.verificationCode) {
      this.router.navigate(['/signin']);
      return;
    }
    this.getAffiliateByVerificationCode(this.verificationCode);
  }

  ngOnInit(): void {
    this.initResetPassword();
    particlesJS.load(
      'particles-js',
      'assets/particles/particles.json',
      function () {},
    );
  }

  get create_reset_password_controls(): { [key: string]: AbstractControl } {
    return this.resetPassword.controls;
  }

  initResetPassword() {
    this.resetPassword = new FormGroup(
      {
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/,
          ),
        ]),
        confirm_password: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/,
          ),
        ]),
      },
      { validators: this.passwordsMatchValidator },
    );

    this.resetPassword.valueChanges.subscribe(() => {
      this.checkPasswords(this.resetPassword);
    });
  }

  confirmation() {
    Swal.fire({
      title: 'Restablecimiento de contraseña',
      text: 'Su contraseña se ha restablecido correctamente.',
      icon: 'success',
      confirmButtonText: 'Entendido',
      timer: 2000,
      showConfirmButton: false,
    });
  }

  passwordsMatchValidator(
    control: AbstractControl,
  ): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirm_password');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { mismatch: true };
  }

  changePassword() {
    this.submitted = true;
    let requestResetPassword = new RequestResetPassword();

    if (this.resetPassword.invalid) return;

    requestResetPassword.password = this.resetPassword.value.password;
    requestResetPassword.verificationCode = this.verificationCode;

    this.affiliateService.resetPassword(requestResetPassword).subscribe({
      next: value => {
        if (value) {
          this.confirmation();
          setTimeout(() => {
            this.router.navigate(['/signin']);
          }, 2000);
        }
      },
      error: err => {},
    });
  }

  getAffiliateByVerificationCode(code: string) {
    timer(3000)
      .pipe(
        switchMap(() =>
          this.affiliateService.getAffiliateByVerificationCode(code),
        ),
      )
      .subscribe({
        next: value => {
          this.isLoading = false;

          if (value === null) {
            this.showExpiredLinkMessage();
            return;
          }

          this.user = value;

          if (this.checkCodeTime()) {
            this.showExpiredLinkMessage();
            return;
          }

          this.startTimer();
        },
        error: () => {
          this.isLoading = false;
          this.router.navigate(['/signin']);
        },
      });
  }

  showExpiredLinkMessage() {
    Swal.fire({
      title: 'Error',
      text: 'El enlace ha expirado, solicite uno nuevamente',
      icon: 'error',
      confirmButtonText: 'Entendido',
    }).then(() => {
      setTimeout(() => {
        this.router.navigate(['/signin']);
      }, 1500);
    });
  }

  checkCodeTime(): boolean {
    let currentTimeUtc = new Date();

    let userUpdateTime = new Date(this.user.updated_at + 'Z');

    let differenceInMinutes =
      (currentTimeUtc.getTime() - userUpdateTime.getTime()) / (1000 * 60);

    if (differenceInMinutes > 10) {
      this.linkValid = false;
      return true;
    }

    this.linkValid = true;
    return false;
  }

  startTimer() {
    const expireMinutes = 10 * 60 * 1000;

    timer(expireMinutes)
      .pipe(take(1))
      .subscribe(() => {
        if (this.checkCodeTime()) {
          this.isLoading = true;
          this.router.navigate(['/signin']);
        }
      });
  }

  checkPasswords(group: FormGroup) {
    let pass = group.controls.password.value;
    let confirmPass = group.controls.confirm_password.value;

    if (pass !== confirmPass) {
      group.setErrors({ mismatch: true });
    } else {
      group.setErrors(null);
    }
  }
}
