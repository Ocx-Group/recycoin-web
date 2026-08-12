import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  CommissionSettings,
  UpdateCommissionSettingsRequest,
} from '@app/core/models/commission-settings-model/commission-settings.model';
import { Response } from '@app/core/models/response-model/response.model';
import { environment } from '@environments/environment';
import { AuthService } from '../authentication-service/auth.service';
import { adminAuthorizedOptions } from '../admin-http/admin-authorized-options';

@Injectable({ providedIn: 'root' })
export class CommissionSettingsService {
  private readonly url = `${environment.apis.systemConfigurationService.replace(/\/$/, '')}/brandconfiguration/admin/commissions`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  getCurrent(): Observable<CommissionSettings> {
    const options = this.authorizedOptions();
    if (!options) {
      return throwError(() => new Error('ADMIN_TOKEN_REQUIRED'));
    }

    return this.http
      .get<Response<CommissionSettings>>(this.url, options)
      .pipe(map(response => this.unwrap(response)));
  }

  updateCurrent(
    request: UpdateCommissionSettingsRequest,
  ): Observable<CommissionSettings> {
    const options = this.authorizedOptions();
    if (!options) {
      return throwError(() => new Error('ADMIN_TOKEN_REQUIRED'));
    }

    return this.http
      .put<Response<CommissionSettings>>(this.url, request, options)
      .pipe(map(response => this.unwrap(response)));
  }

  private authorizedOptions() {
    return adminAuthorizedOptions(this.authService.currentUserAdminValue?.token);
  }

  private unwrap(response: Response<CommissionSettings>): CommissionSettings {
    if (!response?.success || !response.data) {
      throw new Error(response?.message || 'INVALID_COMMISSION_SETTINGS_RESPONSE');
    }
    return response.data;
  }
}
