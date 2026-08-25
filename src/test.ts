// Punto de entrada de Karma: inicializa el entorno de pruebas de Angular y
// siembra el estado que la app da por hecho.

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

import { seedTestSession } from '@app/testing/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
}
);

// AuthService lee el usuario de localStorage al construirse y media app lo
// desreferencia sin comprobar. Se siembra para todos los specs.
beforeEach(() => {
  localStorage.clear();
  seedTestSession();
});
