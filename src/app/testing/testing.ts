/**
 * Infraestructura comun de los specs de humo.
 *
 * Los specs generados por el CLI crean los componentes sin nada del arranque
 * real (`app.config.ts`), asi que aqui se repone lo minimo: router, HttpClient
 * con backend de pruebas, toastr, animaciones y traduccion.
 */
import { EnvironmentProviders, Injectable, Provider } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { provideTranslateService, TranslateNoOpLoader } from '@ngx-translate/core';

import { TicketHubService } from '@app/core/service/ticket-service/ticket-hub.service';

/**
 * TicketHubService abre un WebSocket de SignalR contra produccion desde su
 * propio constructor. En pruebas se hereda solo para anular esa llamada; el
 * resto del servicio queda igual.
 */
@Injectable()
export class TicketHubServiceStub extends TicketHubService {
  override async startConnection(): Promise<void> {
    // sin red en pruebas
  }
}

export const testProviders: (Provider | EnvironmentProviders)[] = [
  provideHttpClient(),
  provideHttpClientTesting(),
  provideRouter([]),
  provideNoopAnimations(),
  provideToastr(),
  // Sin loader real: los specs no comprueban traducciones, solo necesitan que
  // el pipe resuelva.
  provideTranslateService({ loader: TranslateNoOpLoader, fallbackLang: 'en' }),
  { provide: TicketHubService, useClass: TicketHubServiceStub },
];

/** Usuario de sesion que AuthService lee de localStorage al construirse. */
export const testAffiliate = {
  id: 1,
  user_name: 'test',
  email: 'test@example.com',
  image_profile_url: '',
  token: '',
};

/**
 * Muchos componentes asumen sesion iniciada y desreferencian el usuario en
 * ngOnInit o en la plantilla. Se siembra antes de cada spec desde `test.ts`.
 */
export function seedTestSession(): void {
  localStorage.setItem('currentUserAffiliate', JSON.stringify(testAffiliate));
  localStorage.setItem('currentUserAdmin', JSON.stringify(testAffiliate));
}
