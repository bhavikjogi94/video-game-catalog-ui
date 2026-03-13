import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

/**
 * Root application configuration — standalone, no NgModule.
 * All providers are registered here instead of in AppModule.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Zoneless change detection — works natively with Signals without Zone.js
    provideZonelessChangeDetection(),

    // Angular Router with our route definitions
    provideRouter(routes),

    // HttpClient for data-access services (replaces HttpClientModule)
    provideHttpClient(),
  ],
};
