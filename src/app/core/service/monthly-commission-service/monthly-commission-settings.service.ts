import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  MonthlyCommissionSettings,
  UpdateMonthlyCommissionSettingsRequest,
} from '@app/core/models/monthly-commission-model/monthly-commission.model';
import { Response } from '@app/core/models/response-model/response.model';
import { environment } from '@environments/environment';
import { AuthService } from '../authentication-service/auth.service';
import { adminAuthorizedOptions } from '../admin-http/admin-authorized-options';

/**
 * Per-brand defaults of the monthly liquidation. The brand is never sent: the server
 * resolves it from the admin JWT and returns it on `brandId`.
 */
@Injectable({ providedIn: 'root' })
export class MonthlyCommissionSettingsService {
  private readonly url = `${environment.apis.systemConfigurationService.replace(/\/$/, '')}/brandconfiguration/admin/monthly-commissions`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  getCurrent(): Observable<MonthlyCommissionSettings> {
    const options = this.authorizedOptions();
    if (!options) {
      return throwError(() => new Error('ADMIN_TOKEN_REQUIRED'));
    }

    return this.http
      .get<Response<MonthlyCommissionSettings>>(this.url, options)
      .pipe(map(response => this.unwrap(response)));
  }

  updateCurrent(
    request: UpdateMonthlyCommissionSettingsRequest,
  ): Observable<MonthlyCommissionSettings> {
    const options = this.authorizedOptions();
    if (!options) {
      return throwError(() => new Error('ADMIN_TOKEN_REQUIRED'));
    }

    return this.http
      .put<Response<MonthlyCommissionSettings>>(this.url, request, options)
      .pipe(map(response => this.unwrap(response)));
  }

  private authorizedOptions() {
    return adminAuthorizedOptions(this.authService.currentUserAdminValue?.token);
  }

  private unwrap(
    response: Response<MonthlyCommissionSettings>,
  ): MonthlyCommissionSettings {
    if (!response?.success || !response.data) {
      throw new Error(
        response?.message || 'INVALID_MONTHLY_COMMISSION_SETTINGS_RESPONSE',
      );
    }
    return response.data;
  }
}
