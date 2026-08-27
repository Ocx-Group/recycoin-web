import { Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import {
  provideTranslateService,
  TranslateLoader,
  TranslatePipe,
  TranslateService,
} from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';

import { SigninComponent } from './signin.component';

/**
 * Regresion de las etiquetas del login.
 *
 * Antes venian de setLabels(), que llamaba a translate.instant() en ngOnInit
 * bajo el guard `currentLang != undefined`. En ngx-translate 18 ese guard dejo
 * de significar "ya hay traducciones": use() fija currentLang de forma sincrona
 * ("on init set the currentLang immediately, but do not emit a change yet") y
 * el fichero de idioma llega despues por HTTP. instant() devolvia la clave, el
 * campo se quedaba con ella para siempre y el login mostraba
 * SIGNIN.USER-NAME.TEXT en vez de "Su Usuario".
 *
 * El loader de esta prueba resuelve tarde a proposito: es la unica forma de
 * reproducirlo. Con las etiquetas por el pipe, el texto llega igualmente.
 */
@Injectable()
class LoaderTardioStub extends TranslateLoader {
  static pendientes: Array<() => void> = [];

  getTranslation(lang: string): Observable<any> {
    if (lang !== 'es') return of({});
    return new Observable(observer => {
      // No emite hasta que la prueba lo suelte: simula el viaje HTTP.
      LoaderTardioStub.pendientes.push(() => {
        observer.next({
          SIGNIN: {
            'USER-NAME': { TEXT: 'Su Usuario' },
            PASSWORD: { TEXT: 'Contrasena' },
            'FORGOT-PASS': { TEXT: 'Cambiar contrasena' },
            TITLE: { TEXT: 'Iniciar sesion' },
          },
        });
        observer.complete();
      });
    });
  }
}

describe('SigninComponent: las etiquetas se traducen aunque el idioma llegue tarde', () => {
  let fixture: ComponentFixture<SigninComponent>;

  beforeEach(async () => {
    LoaderTardioStub.pendientes = [];

    await TestBed.configureTestingModule({
      imports: [SigninComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
        provideToastr(),
        provideTranslateService({ loader: LoaderTardioStub, fallbackLang: 'en' }),
      ],
    }).compileComponents();

    TestBed.inject(TranslateService).use('es');

    fixture = TestBed.createComponent(SigninComponent);
    fixture.detectChanges();
  });

  // Las tres apps tienen plantillas de login distintas: se comprueba clave a
  // clave, solo sobre las que este login pinte de verdad.
  const CLAVES: Array<[string, string]> = [
    ['SIGNIN.USER-NAME.TEXT', 'Su Usuario'],
    ['SIGNIN.PASSWORD.TEXT', 'Contrasena'],
    ['SIGNIN.FORGOT-PASS.TEXT', 'Cambiar contrasena'],
    ['SIGNIN.TITLE.TEXT', 'Iniciar sesion'],
  ];

  function textoVisible(): string {
    const html: HTMLElement = fixture.nativeElement;
    const marcadores = Array.from(
      html.querySelectorAll('[placeholder]') as NodeListOf<HTMLInputElement>,
    ).map(e => e.getAttribute('placeholder'));
    return html.textContent + ' ' + marcadores.join(' ');
  }

  it('sustituye la clave por el texto en cuanto el idioma resuelve', () => {
    const antes = textoVisible();
    const pintadas = CLAVES.filter(([clave]) => antes.includes(clave));
    expect(pintadas.length)
      .withContext('este login no pinta ninguna de las claves conocidas')
      .toBeGreaterThan(0);

    LoaderTardioStub.pendientes.forEach(soltar => soltar());
    fixture.detectChanges();

    const despues = textoVisible();
    pintadas.forEach(([clave, texto]) => {
      expect(despues).withContext(clave + ' sigue cruda').not.toContain(clave);
      expect(despues).withContext('falta la traduccion de ' + clave).toContain(texto);
    });
  });
});
