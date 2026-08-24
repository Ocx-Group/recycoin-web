import {
  ApplicationConfig,
  importProvidersFrom,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, HttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';

// Firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { firebaseConfig } from '@environments/environment';

// Translate
import {
  TranslateService,
  provideTranslateService,
} from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

// Loading Bar
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';

// Toastr
import { provideToastr } from 'ngx-toastr';

// Routes
import { routes } from './app.routes';
import { BrandingService } from './core/service/branding-service/branding.service';
import { runtimeTenantInterceptor } from './core/interceptor/runtime-tenant.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideAnimations(),
    provideHttpClient(withXhr(), withInterceptors([runtimeTenantInterceptor])),
    provideAppInitializer(() => inject(BrandingService).load()),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
    }),
    { provide: LocationStrategy, useClass: PathLocationStrategy },

    // Firebase
    provideFirebaseApp(() => initializeApp(firebaseConfig)),

    // Translate
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
    }),
    importProvidersFrom(LoadingBarRouterModule),

    // Language initialization
    provideAppInitializer(() => {
      const translate = inject(TranslateService);
      translate.setFallbackLang('en');
      const savedLang = localStorage.getItem('lang') || 'en';
      translate.use(savedLang);
      localStorage.setItem('lang', savedLang);
    }),
  ],
};
