import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';

import { Response } from '@app/core/models/response-model/response.model';
import { Product } from '@app/core/models/product-model/product.model';
const httpOptions = {

  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': environment.tokens.inventoryService.toString(),
    'X-Client-ID': environment.tokens.clientID.toString()
  }),
};
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private urlApi: string;
  private readonly paymentGroups = {
    ecoPools: 2,
    services: 3,
    fundingAccounts: 5,
    tradingAcademy: 14,
    savingsPlans: 7,
    savingsPlansOneB: 8,
    alternativeHealth: 9,
    alternativeHealthForEurope: 10,
    recyCoin: 11,
  };

  constructor(private router: Router, private http: HttpClient) {
    this.urlApi = environment.apis.inventoryService;
  }

  getProductsByBrand(filters: {
    productIds?: number[];
    paymentGroupIds?: number[];
    productType?: boolean;
    state?: boolean;
    visible?: boolean;
    visiblePublic?: boolean;
    includeDeleted?: boolean;
  } = {}) {
    let params = new HttpParams();

    filters.productIds?.forEach(id => {
      params = params.append('productIds', id.toString());
    });

    filters.paymentGroupIds?.forEach(id => {
      params = params.append('paymentGroupIds', id.toString());
    });

    if (filters.productType !== undefined) params = params.set('productType', String(filters.productType));
    if (filters.state !== undefined) params = params.set('state', String(filters.state));
    if (filters.visible !== undefined) params = params.set('visible', String(filters.visible));
    if (filters.visiblePublic !== undefined) params = params.set('visiblePublic', String(filters.visiblePublic));
    if (filters.includeDeleted !== undefined) params = params.set('includeDeleted', String(filters.includeDeleted));

    return this.http.get<Response>(this.urlApi.concat('/product/by-brand'), { ...httpOptions, params }).pipe(
      map((response) => {
        if (response.success) return response.data;
        else {
          console.error('ERROR: ' + response);
          return null;
        }
      })
    );
  }

  getAllEcoPooles() {
    return this.getProductsByBrand({ paymentGroupIds: [this.paymentGroups.ecoPools] });
  }

  getAllServices() {
    return this.getProductsByBrand({ paymentGroupIds: [this.paymentGroups.services] });
  }

  getAllProductsAdmin() {
    return this.getProductsByBrand({ productType: false });
  }

  getAllMembership() {
    return this.getProductsByBrand({ productType: true });
  }

  createProduct(product: Product) {
    return this.http
      .post<Response>(this.urlApi.concat('/product'), product, httpOptions)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  updateProduct(product: Product) {
    return this.http
      .put<Response>(
        this.urlApi.concat('/product/', product.id.toString()),
        product,
        httpOptions
      )
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  delete(id: number) {
    return this.http
      .delete<Response>(this.urlApi.concat('/product/', id.toString()), httpOptions)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  getAllFundingAccounts() {
    return this.getProductsByBrand({ paymentGroupIds: [this.paymentGroups.fundingAccounts] });
  }

  getAllTradingAcademy() {
    return this.getProductsByBrand({ paymentGroupIds: [this.paymentGroups.tradingAcademy] });
  }

  getAllSavingsPlans() {
    return this.getProductsByBrand({ paymentGroupIds: [this.paymentGroups.savingsPlans] });
  }

  getAllSavingsPlansOneB() {
    return this.getProductsByBrand({ paymentGroupIds: [this.paymentGroups.savingsPlansOneB] });
  }

  getAllAlternativeHealth() {
    return this.getProductsByBrand({ paymentGroupIds: [this.paymentGroups.alternativeHealth] });
  }

  getAllAlternativeHealthForEurope() {
    return this.getProductsByBrand({ paymentGroupIds: [this.paymentGroups.alternativeHealthForEurope] });
  }

  getAllRecyCoin() {
    return this.getProductsByBrand({ paymentGroupIds: [this.paymentGroups.recyCoin] });
  }
}
