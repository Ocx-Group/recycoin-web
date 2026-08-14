import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { PagedResult } from './../../interfaces/paged-result';
import { PaginationRequest } from './../../interfaces/pagination-request';
import { ModelBalancesInvoices } from './../../models/invoice-model/model-balances-invoices';
import { MonthlyPurchases } from './../../models/invoice-model/monthly-purchases.model';

import { Invoice } from '@app/core/models/invoice-model/invoice.model';
import { Response } from '@app/core/models/response-model/response.model';
import { environment } from '@environments/environment';
import { Observable, of } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: environment.tokens.walletService.toString(),
    'X-Client-ID': environment.tokens.clientID.toString(),
  }),
};

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private urlApi: string;

  constructor(private router: Router, private http: HttpClient) {
    this.urlApi = environment.apis.walletService;
  }

  getAllInvoicesUser(id: number): Observable<Invoice[]> {
    return this.http
      .get<Invoice[]>(
        this.urlApi.concat(
          '/invoice/GetAllInvoicesByUserId?id=',
          id.toString(),
        ),
        httpOptions,
      )
      .pipe(
        map(response => {
          if (Array.isArray(response)) {
            return response;
          } else {
            console.error('ERROR: ' + response);
            return null;
          }
        }),
      );
  }

  getAllInvoices(
    request: PaginationRequest,
  ): Observable<Response<PagedResult<Invoice>> | null> {
    const params = new HttpParams({
      fromObject: {
        pageSize: request.pageSize.toString(),
        pageNumber: request.pageNumber.toString(),
        ...(request.startDate && {
          startDate: request.startDate.toISOString(),
        }),
        ...(request.endDate && { endDate: request.endDate.toISOString() }),
      },
    });

    return this.http
      .get<Response<PagedResult<Invoice>>>(
        `${this.urlApi}/invoice/GetAllInvoices`,
        { ...httpOptions, params },
      )
      .pipe(
        map(response => response || null),
        catchError(error => {
          console.error('Error getting invoices:', error);
          return of(null);
        }),
      );
  }

  getMonthlyPurchasesSummary(months = 12): Observable<MonthlyPurchases[]> {
    const params = new HttpParams().set('months', months.toString());

    return this.http
      .get<Response<MonthlyPurchases[]>>(
        `${this.urlApi}/invoice/GetMonthlyPurchasesSummary`,
        { ...httpOptions, params },
      )
      .pipe(map(response => response?.data ?? []));
  }

  getAllInvoicesForTradingAcademyPurchases() {
    return this.http
      .get<Response>(
        this.urlApi.concat('/invoice/GetAllInvoicesForTradingAcademyPurchases'),
        httpOptions,
      )
      .pipe(
        map(response => {
          return response.data;
        }),
      );
  }

  sendInvitationsForUpcomingCourses(link: string, code: string) {
    let params = new HttpParams().set('link', link).set('code', code);

    const urlWithParams = `${
      this.urlApi
    }/invoice/SendInvitationsForUpcomingCourses?${params.toString()}`;
    return this.http.post<Response>(urlWithParams, {}, httpOptions).pipe(
      map(response => {
        return response;
      }),
    );
  }

  getAllInvoicesForModelOneAndTwo() {
    return this.http
      .get<Response>(
        this.urlApi.concat('/invoice/GetAllInvoicesForModelOneAndTwo'),
        httpOptions,
      )
      .pipe(
        map(response => {
          return response.data;
        }),
      );
  }

  processAndReturnBalancesForModels1A1B2(request: ModelBalancesInvoices) {
    return this.http
      .post<Response>(
        this.urlApi.concat('/invoice/ProcessAndReturnBalancesForModels1A1B2'),
        request,
        httpOptions,
      )
      .pipe(
        map(response => {
          return response.data;
        }),
      );
  }

  createInvoice(invoiceId: number): Observable<Blob> {
    const options = {
      responseType: 'blob' as 'json',
      params: new HttpParams().set('invoiceId', invoiceId.toString()),
      headers: new HttpHeaders({
        Authorization: environment.tokens.walletService.toString(),
        'X-Client-ID': environment.tokens.clientID.toString(),
      }),
    };

    return this.http.get<Blob>(
      `${this.urlApi}/invoice/create_invoice`,
      options,
    );
  }

  createInvoiceByReference(
    reference: string,
  ): Observable<{ blob: Blob; brandId: number | null }> {
    const options = {
      responseType: 'blob' as 'json',
      params: new HttpParams().set('reference', reference.toString()),
      headers: new HttpHeaders({
        Authorization: environment.tokens.walletService.toString(),
        'X-Client-ID': environment.tokens.clientID.toString(),
      }),
      observe: 'response' as const,
    };

    return this.http
      .get(`${this.urlApi}/invoice/create_invoice_by_reference`, options)
      .pipe(
        map((response: HttpResponse<Blob>) => {
          const brandIdHeader = response.headers.get('X-Brand-Id');
          const brandId = brandIdHeader ? parseInt(brandIdHeader, 10) : null;
          console.log('Brand ID:', brandId);
          return {
            blob: response.body as Blob,
            brandId: brandId,
          };
        }),
      );
  }

  exportToExcel(startDate?: Date, endDate?: Date): Observable<Blob> {
    const params = new HttpParams({
      fromObject: {
        ...(startDate && { startDate: startDate.toISOString() }),
        ...(endDate && { endDate: endDate.toISOString() }),
      },
    });

    const options = {
      responseType: 'blob' as 'json',
      params,
      headers: new HttpHeaders({
        Authorization: environment.tokens.walletService.toString(),
        'X-Client-ID': environment.tokens.clientID.toString(),
      }),
    };

    return this.http.get<Blob>(`${this.urlApi}/invoice/ExportToExcel`, options);
  }
}
