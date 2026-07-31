import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  BrandingAdministration,
  UpdateOwnBrandingRequest,
} from '@app/core/models/branding-model/branding-administration.model';
import { Response } from '@app/core/models/response-model/response.model';
import { environment } from '@environments/environment';
import { AuthService } from '../authentication-service/auth.service';

@Injectable({ providedIn: 'root' })
export class BrandingAdministrationService {
  private readonly url = `${environment.apis.systemConfigurationService.replace(/\/$/, '')}/brandconfiguration/admin/current`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  getCurrent(): Observable<BrandingAdministration> {
    const options = this.authorizedOptions();
    if (!options) {
      return throwError(() => new Error('ADMIN_TOKEN_REQUIRED'));
    }

    return this.http
      .get<Response<BrandingAdministration>>(this.url, options)
      .pipe(map(response => this.unwrap(response)));
  }

  updateCurrent(
    request: UpdateOwnBrandingRequest,
  ): Observable<BrandingAdministration> {
    const options = this.authorizedOptions();
    if (!options) {
      return throwError(() => new Error('ADMIN_TOKEN_REQUIRED'));
    }

    return this.http
      .put<Response<BrandingAdministration>>(this.url, request, options)
      .pipe(map(response => this.unwrap(response)));
  }

  private authorizedOptions(): { headers: HttpHeaders } | null {
    const token = this.authService.currentUserAdminValue?.token;
    return token
      ? {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }),
        }
      : null;
  }

  private unwrap(
    response: Response<BrandingAdministration>,
  ): BrandingAdministration {
    if (!response?.success || !response.data) {
      throw new Error(response?.message || 'INVALID_BRANDING_RESPONSE');
    }
    return response.data;
  }
}
