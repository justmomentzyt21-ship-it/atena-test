import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { PRODUCT_REPOSITORY } from './core/tokens/product-repository.token';
import { GoogleSheetsProductAdapter } from './core/services/google-sheets-product.adapter';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  provideClientHydration,
  withEventReplay,
  withHttpTransferCacheOptions,
} from '@angular/platform-browser';
import { BANNER_REPOSITORY } from './core/tokens/banner-repository.token';
import { GoogleSheetsBannerAdapter } from './core/services/google-sheets-banner.adapter';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    { provide: PRODUCT_REPOSITORY, useClass: GoogleSheetsProductAdapter },
    { provide: BANNER_REPOSITORY, useClass: GoogleSheetsBannerAdapter },
    provideClientHydration(
      withEventReplay(),
      withHttpTransferCacheOptions({
        includePostRequests: false,
      }),
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
