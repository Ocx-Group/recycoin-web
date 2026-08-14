import { UpdateImageProfile } from './../../models/user-affiliate-model/update-image-profile.model';
import { UpdateImageIdPath } from './../../models/user-affiliate-model/update-image-id-path.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '@environments/environment';
import { map, catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { PagedResult } from '@app/core/interfaces/paged-result';
import { PaginationRequest } from '@app/core/interfaces/pagination-request';
import { UpdatePassword } from '@app/core/models/user-model/update.password.model';
import { SecretQuestion } from '@app/core/models/secret-question-model/secret.question.model';

import { Response } from '@app/core/models/response-model/response.model';
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { MonthlyRegistrations } from '@app/core/models/user-affiliate-model/monthly-registrations.model';
import { CreateAffiliate } from '@app/core/models/user-affiliate-model/create-affiliate.model';
import { RequestResetPassword } from '@app/core/models/user-affiliate-model/request-reset-password-model';
import { ContactUsRequest } from '@app/core/models/user-affiliate-model/contactUsRequest.model';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: environment.tokens.accountService.toString(),
    'X-Client-ID': environment.tokens.clientID.toString(),
  }),
};

@Injectable({
  providedIn: 'root',
})
export class AffiliateService {
  private urlApi: string;
  private idSource = new BehaviorSubject<number>(null);
  public currentId = this.idSource.asObservable();

  constructor(private http: HttpClient) {
    this.urlApi = environment.apis.accountService;
  }

  changeId(id: number) {
    this.idSource.next(id);
  }

  getAll() {
    return this.http
      .get<Response>(
        this.urlApi.concat('/userAffiliateInfo/get_all'),
        httpOptions,
      )
      .pipe(
        map(response => {
          if (response.success) return response.data;
          else {
            console.error('ERROR: ' + response);
            return null;
          }
        }),
      );
  }

  getAllPaged(
    request: PaginationRequest,
  ): Observable<Response<PagedResult<UserAffiliate>> | null> {
    const params = new HttpParams({
      fromObject: {
        pageSize: request.pageSize.toString(),
        pageNumber: request.pageNumber.toString(),
        ...(request.search && { search: request.search }),
      },
    });

    return this.http
      .get<Response<PagedResult<UserAffiliate>>>(
        `${this.urlApi}/userAffiliateInfo/get_all_paged`,
        { ...httpOptions, params },
      )
      .pipe(
        map(response => response || null),
        catchError(error => {
          console.error('Error getting affiliates:', error);
          return of(null);
        }),
      );
  }

  getAllAffiliatesAuthorization() {
    return this.http
      .get<Response>(
        this.urlApi.concat('/userAffiliateInfo/get_all_without_authorization'),
        httpOptions,
      )
      .pipe(
        map(response => {
          if (response.success) return response.data;
          else {
            console.error('ERROR: ' + response);
            return null;
          }
        }),
      );
  }

  getCountries() {
    return this.http
      .get<Response>(this.urlApi.concat('/auth/countries'), httpOptions)
      .pipe(
        map(response => {
          if (response.success) return response.data;
          else {
            console.error('ERROR: ' + response);
            return null;
          }
        }),
      );
  }

  updateAffiliate(affiliate: UserAffiliate) {
    return this.http
      .put<Response>(
        `${this.urlApi}/useraffiliateinfo/${affiliate.id}`,
        affiliate,
        httpOptions,
      )
      .pipe(
        map(response => {
          if (response.success) return response.data;
          else {
            console.error('ERROR: ' + response);
            return null;
          }
        }),
      );
  }

  updateUserProfile(affiliate: UserAffiliate) {
    return this.http
      .put<Response>(
        `${this.urlApi}/useraffiliateinfo/update_user_profile/${affiliate.id}`,
        affiliate,
        httpOptions,
      )
      .pipe(
        map(response => {
          if (response.success) return response.data;
          else {
            console.error('ERROR: ' + response);
            return null;
          }
        }),
      );
  }

  authorizationAffiliates(approvedArray: any[], disApprovedArray: any[]) {
    let request = { approvedArray, disApprovedArray };

    return this.http
      .post<Response>(
        this.urlApi.concat('/useraffiliateinfo/authorization_affiliates'),
        request,
        httpOptions,
      )
      .pipe(
        map(data => {
          return data;
        }),
      );
  }

  sendEmailConfirm(id: number) {
    return this.http
      .post<Response>(
        this.urlApi.concat(
          '/useraffiliateinfo/send_email_confirmation/',
          id.toString(),
        ),
        {},
        httpOptions,
      )
      .pipe(
        map(data => {
          return data;
        }),
      );
  }

  getAffiliateByUserName(username: string) {
    return this.http
      .get<Response>(
        this.urlApi.concat('/useraffiliateinfo/get_user_username/' + username),
        httpOptions,
      )
      .pipe(
        map(response => {
          if (response.success) return response.data;
          else {
            console.error('ERROR: ' + response);
            return null;
          }
        }),
        catchError(error => {
          return throwError(error);
        }),
      );
  }

  getAffiliateById(id: number) {
    return this.http
      .get<Response>(
        `${this.urlApi}/useraffiliateinfo/get_user_id/${id}`,
        httpOptions,
      )
      .pipe(
        map(response => {
          if (response.success) return response;
          else {
            console.error('ERROR: ' + response);
            return null;
          }
        }),
        catchError(error => {
          return throwError(error);
        }),
      );
  }

  GetPersonalNetwork(id: number) {
    return this.http
      .get<Response>(
        `${this.urlApi}/UserAffiliateInfo/getPersonalNetwork/${id}`,
        httpOptions,
      )
      .pipe(
        map(response => {
          if (response.success) return response.data;
          else {
            console.error('ERROR: ' + response);
            return null;
          }
        }),
        catchError(error => {
          return throwError(error);
        }),
      );
  }

  createAffiliate(user: CreateAffiliate) {
    return this.http
      .post<Response>(
        this.urlApi.concat('/useraffiliateinfo'),
        user,
        httpOptions,
      )
      .pipe(
        map(data => {
          return data;
        }),
      );
  }

  updatePassword(user: UpdatePassword) {
    return this.http
      .put<Response>(
        this.urlApi.concat(
          '/useraffiliateinfo/update_password_user/',
          user.id.toString(),
        ),
        user,
        httpOptions,
      )
      .pipe(
        map(data => {
          return data;
        }),
      );
  }

  updatePin(user: UpdatePassword) {
    return this.http
      .put<Response>(
        `${this.urlApi}/useraffiliateinfo/update_pin/${user.id})`,
        user,
        httpOptions,
      )
      .pipe(
        map(data => {
          return data;
        }),
      );
  }

  updateSecretQuestion(data: SecretQuestion) {
    return this.http
      .put<Response>(
        `${this.urlApi}/useraffiliateinfo/secret_question/${data.id})`,
        data,
        httpOptions,
      )
      .pipe(
        map(data => {
          return data;
        }),
      );
  }

  getBinaryTree(id: number) {
    let url =
      id == 0
        ? `/LeaderBoard/model4/getTree`
        : `/LeaderBoard/model4/getTree?id=${id}`;

    return this.http.get<Response>(`${this.urlApi}${url}`, httpOptions).pipe(
      map(response => {
        if (response.success) return JSON.parse(response.data);
        else {
          console.error('ERROR: ' + response);
          return null;
        }
      }),
    );
  }

  getTreeModel5(id: number) {
    let url =
      id == 0
        ? `/LeaderBoard/model5/getTree`
        : `/LeaderBoard/model5/getTree?id=${id}`;

    return this.http.get<Response>(`${this.urlApi}${url}`, httpOptions).pipe(
      map(response => {
        if (response.success) return response.data;
        else {
          console.error('ERROR: ' + response);
          return null;
        }
      }),
    );
  }

  getTreeModel6(id: number) {
    let url =
      id == 0
        ? `/LeaderBoard/model6/getTree`
        : `/LeaderBoard/model6/getTree?id=${id}`;

    return this.http.get<Response>(`${this.urlApi}${url}`, httpOptions).pipe(
      map(response => {
        if (response.success) return response.data;
        else {
          console.error('ERROR: ' + response);
          return null;
        }
      }),
    );
  }

  getUniLevelTree(id: number) {
    const url = id == 0 ? `/matrix/uni_level` : `/matrix/uni_level?id=${id}`;

    return this.http.get<Response>(`${this.urlApi}${url}`, httpOptions).pipe(
      map(response => {
        if (response.success) return response.data;
        else {
          console.error('ERROR: ' + response);
          return null;
        }
      }),
    );
  }

  updateImageIdPath(updateImageIdPath: UpdateImageIdPath) {
    return this.http
      .put<Response>(
        `${this.urlApi}/useraffiliateinfo/update_image_id_path/${updateImageIdPath.id}`,
        updateImageIdPath,
        httpOptions,
      )
      .pipe(
        map(response => {
          if (response.success) return response.data;
          else {
            console.error('ERROR: ' + response);
            return null;
          }
        }),
      );
  }

  generateVerificationCode(
    id: number,
    checkDate: boolean,
  ): Observable<Response> {
    const params = new HttpParams().set('checkDate', checkDate.toString());

    return this.http
      .post<Response>(
        `${
          this.urlApi
        }/useraffiliateinfo/generateVerificationCode/${id.toString()}`,
        {},
        {
          headers: httpOptions.headers,
          params: params,
        },
      )
      .pipe(
        map(response => {
          if (!response.success) {
            console.error('ERROR: ' + response.message);
          }
          return response;
        }),
      );
  }

  getTotalActiveMembers() {
    return this.http
      .get<Response>(
        `${this.urlApi}/useraffiliateinfo/getTotalActiveMembers`,
        httpOptions,
      )
      .pipe(
        map(response => {
          if (response.success) return response;
          else {
            console.error('ERROR: ' + response);
            return null;
          }
        }),
        catchError(error => {
          return throwError(error);
        }),
      );
  }

  updateCardIdAuthorization(id: number, option: number) {
    return this.http
      .put<Response>(
        `${this.urlApi}/useraffiliateinfo/update_card_id_authorization/${id}`,
        option,
        httpOptions,
      )
      .pipe(
        map(response => {
          if (response.success) return response.data;
          else {
            console.error('ERROR: ' + response);
            return null;
          }
        }),
      );
  }

  sendPasswordRecovery(email: string) {
    return this.http
      .post<Response>(
        this.urlApi.concat('/useraffiliateinfo/sendEmailToChangePassword'),
        JSON.stringify(email),
        httpOptions,
      )
      .pipe(
        map(data => {
          return data;
        }),
      );
  }

  getAffiliateByVerificationCode(code: string) {
    return this.http
      .get<Response>(
        this.urlApi.concat(
          '/useraffiliateinfo/getAffiliateByVerificationCode/' + code,
        ),
        httpOptions,
      )
      .pipe(
        map(response => {
          if (response.success) return response.data;
          else {
            console.error('ERROR: ' + response);
            return null;
          }
        }),
        catchError(error => {
          return throwError(error);
        }),
      );
  }

  resetPassword(requestResetPassword: RequestResetPassword) {
    return this.http
      .post<Response>(
        this.urlApi.concat('/useraffiliateinfo/resetPassword'),
        requestResetPassword,
        httpOptions,
      )
      .pipe(
        map(data => {
          return data;
        }),
      );
  }

  getTotalAffiliatesByCountries() {
    return this.http
      .get<Response>(
        `${this.urlApi}/useraffiliateinfo/getTotalAffiliatesByCountries`,
        httpOptions,
      )
      .pipe(
        map(response => {
          if (response.success) return response;
          else {
            console.error('ERROR: ' + response);
            return null;
          }
        }),
        catchError(error => {
          return throwError(error);
        }),
      );
  }

  updateImageProfile(id: number, imgProfile: UpdateImageProfile) {
    return this.http
      .put<Response>(
        `${this.urlApi}/useraffiliateinfo/update_image/${id}`,
        imgProfile,
        httpOptions,
      )
      .pipe(
        map(response => {
          if (response.success) return response.data;
          else {
            console.error('ERROR: ' + response);
            return null;
          }
        }),
      );
  }

  updateMessageAlert(affiliateId: number) {
    return this.http
      .put<Response>(
        `${this.urlApi}/useraffiliateinfo/update_message_alert/${affiliateId}`,
        {},
        httpOptions,
      )
      .pipe(
        map(response => {
          if (response.success) return response.data;
          else {
            console.error('ERROR: ' + response);
            return null;
          }
        }),
      );
  }

  contactUs(contact: ContactUsRequest) {
    return this.http
      .post<Response>(
        `${this.urlApi}/useraffiliateinfo/contact_us`,
        contact,
        httpOptions,
      )
      .pipe(
        map(response => {
          return response;
        }),
      );
  }

  getMonthlyRegistrationsSummary(months = 12): Observable<MonthlyRegistrations[]> {
    const params = new HttpParams().set('months', months.toString());

    return this.http
      .get<Response<MonthlyRegistrations[]>>(
        `${this.urlApi}/useraffiliateinfo/getMonthlyRegistrationsSummary`,
        { ...httpOptions, params },
      )
      .pipe(map(response => response?.data ?? []));
  }

  getLastRegisteredAffiliates(): Observable<Response> {
    return this.http.get<Response>(
      `${this.urlApi}/useraffiliateinfo/get_last_registered_users`,
      httpOptions,
    );
  }
}
