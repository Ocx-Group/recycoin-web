import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { AuthService } from '../service/authentication-service/auth.service';

/**
 * Mirrors the `BrandAdministrator` policy of ConfigurationService, which requires
 * the `Administrador` role. `AuthGuardAdmin` only proves that an administrative
 * session exists, so without this guard a lesser role could open the branding
 * screen and only discover the restriction through a 403.
 */
@Injectable({ providedIn: 'root' })
export class BrandAdministratorGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  canActivate(): boolean {
    if (this.authService.currentUserAdminValue?.rol_name === 'Administrador') {
      return true;
    }

    this.router.navigate(['/admin/home-admin']);
    return false;
  }
}
