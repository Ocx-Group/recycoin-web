import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RuntimeTenantService {
  private value: string | null = null;

  get clientId(): string | null {
    return this.value;
  }

  setClientId(clientId: string): void {
    this.value = clientId;
  }
}
