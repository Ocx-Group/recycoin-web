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

// Dos componentes llaman al global particlesJS en ngOnInit. Cargar la
// libreria de verdad no sirve: pide assets/particles/particles.json por XHR y
// el callback llega cuando el fixture ya se destruyo, buscando un elemento que
// ya no existe. Se sustituye por un doble sin efectos.
(globalThis as any).particlesJS = Object.assign(() => {}, { load: () => {} });
