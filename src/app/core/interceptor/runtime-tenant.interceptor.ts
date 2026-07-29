import {
  HttpHandler,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { RuntimeTenantService } from '../service/branding-service/runtime-tenant.service';

function isInternalApi(url: string): boolean {
  return [
    environment.apis.accountService,
    environment.apis.systemConfigurationService,
    environment.apis.inventoryService,
    environment.apis.walletService,
  ].some(baseUrl => url.startsWith(baseUrl));
}

function withRuntimeTenant(
  request: HttpRequest<unknown>,
  tenant: RuntimeTenantService,
): HttpRequest<unknown> {
  const clientId = tenant.clientId;
  return clientId && isInternalApi(request.url)
    ? request.clone({ setHeaders: { 'X-Client-ID': clientId } })
    : request;
}

@Injectable()
export class RuntimeTenantInterceptor implements HttpInterceptor {
  constructor(private readonly tenant: RuntimeTenantService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler) {
    return next.handle(withRuntimeTenant(request, this.tenant));
  }
}

export const runtimeTenantInterceptor: HttpInterceptorFn = (request, next) =>
  next(withRuntimeTenant(request, inject(RuntimeTenantService)));
