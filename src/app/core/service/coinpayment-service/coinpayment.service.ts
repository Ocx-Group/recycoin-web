import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable, map } from 'rxjs';

import { Response } from '@app/core/models/response-model/response.model';
import { WalletRequestRequest } from '@app/core/models/wallet-request-request-model/wallet-request-request.model';
import { CoinPaymentWithdrawalResponse } from '@app/core/models/coinpayment-model/coinpayment-withdrawal-response.model';
import { CreatePayment } from '../../models/coinpayment-model/create-payment.model';
import { ConpaymentTransaction } from '../../models/coinpayment-model/conpayment-transaction.model';

const httpOptions = {

  headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': environment.tokens.walletService.toString(), 'X-Client-ID': environment.tokens.clientID.toString() }),
};


@Injectable({
  providedIn: 'root',
})
export class CoinpaymentService {
  private urlApi: string;
  private transactionStatus = new BehaviorSubject<number>(-1);
  currentStatus = this.transactionStatus.asObservable();

  constructor(private router: Router, private http: HttpClient) {
    this.urlApi = environment.apis.walletService;
  }

  changeStatus(status: number) {
    this.transactionStatus.next(status);
  }

  createTransaction(transactionRequest: CreatePayment) {
    return this.http
      .post<ConpaymentTransaction>(this.urlApi.concat('/conPayments/createPayment'), transactionRequest, httpOptions);
  }

  getTransactionInfo(idTransaction: string, fullInfo: boolean) {
    const params = new HttpParams()
      .set('idTransaction', idTransaction)
      .set('fullInfo', fullInfo.toString());

    const requestOptions = { ...httpOptions, params: params };

    return this.http
      .get<Response>(this.urlApi.concat('/conPayments/getTransactionInfo'), requestOptions)
      .pipe(
        map((response) => {
          if (response.success) return response.data;
          else {
            console.error('ERROR: ' + response);
            return null;
          }
        })
      );
  }

  createMassWithdrawal(walletsRequests: WalletRequestRequest[]): Observable<CoinPaymentWithdrawalResponse> {
    return this.http
      .post<CoinPaymentWithdrawalResponse>(
        this.urlApi.concat('/conPayments/createMassWithdrawal'),
        walletsRequests,
        httpOptions
      )
      .pipe(
        map((data: CoinPaymentWithdrawalResponse) => {
          return data;
        })
      );
  }
}
