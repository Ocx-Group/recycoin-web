import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';


import { AuthService } from '@app/core/service/authentication-service/auth.service';

@Component({
    selector: 'app-email-confirmation',
    templateUrl: './email.confirmation.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: []
})
export class EmailConfirmationComponent {

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router){

    let userName = this.activatedRoute.snapshot.params.userName;
    if (userName === null) {
      this.router.navigate(['/signin']);
    }
    this.emailConfirmation(userName);
  }

  emailConfirmation(userName: string) {
    this.authService.UserAffiliateEmailConfirmation(userName).subscribe(
      (result) => {
        Swal.fire({
          title: 'Su correo electrónico ha sido confirmado correctamente.',
          showCancelButton: false,
          confirmButtonColor: '#8963ff',
          confirmButtonText: 'Ingresar',
        }).then((result) => {
          this.router.navigate(['/signin']);
        });
      },
      (err: any) => {
        this.router.navigate(['/signin']);
      }
    );
  }
}

