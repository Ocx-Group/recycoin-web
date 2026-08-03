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
    if (!token || this.isExpired(token)) return null;

    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  /**
   * The administrative JWT is short lived and there is no refresh endpoint, so a
   * stale session is the normal end state of a long editing session. Detecting it
   * here turns a confusing 401 into the same explicit re-login message.
   */
  private isExpired(token: string): boolean {
    const expiresAt = this.readExpiry(token);
    return expiresAt !== null && expiresAt <= Date.now();
  }

  private readExpiry(token: string): number | null {
    const payload = token.split('.')[1];
    if (!payload) return null;

    try {
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const claims = JSON.parse(atob(normalized));
      return typeof claims?.exp === 'number' ? claims.exp * 1000 : null;
    } catch {
      // An unreadable token is left to the server, which is the only authority.
      return null;
    }
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
