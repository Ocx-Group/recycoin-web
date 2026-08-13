import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  MonthlyCommissionResult,
  MonthlyCommissionRunRequest,
} from '@app/core/models/monthly-commission-model/monthly-commission.model';
import { Response } from '@app/core/models/response-model/response.model';
import { environment } from '@environments/environment';
import { AuthService } from '../authentication-service/auth.service';
import { adminAuthorizedOptions } from '../admin-http/admin-authorized-options';

/**
 * Runs the monthly liquidation. Unlike the rest of the wallet API this endpoint
 * authenticates with the admin JWT, because it credits real balances and the brand it
 * credits comes from the token rather than from a header.
 */
@Injectable({ providedIn: 'root' })
export class MonthlyCommissionService {
  private readonly url = `${environment.apis.walletService.replace(/\/$/, '')}/monthlyCommission/calculate`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  calculate(
    request: MonthlyCommissionRunRequest,
  ): Observable<MonthlyCommissionResult> {
    const options = adminAuthorizedOptions(
      this.authService.currentUserAdminValue?.token,
    );
    if (!options) {
      return throwError(() => new Error('ADMIN_TOKEN_REQUIRED'));
    }

    return this.http
      .post<Response<MonthlyCommissionResult>>(this.url, request, options)
      .pipe(map(response => this.unwrap(response)));
  }

  private unwrap(
    response: Response<MonthlyCommissionResult>,
  ): MonthlyCommissionResult {
    if (!response?.success || !response.data) {
      throw new Error(response?.message || 'INVALID_MONTHLY_COMMISSION_RESPONSE');
    }
    return response.data;
  }
}
