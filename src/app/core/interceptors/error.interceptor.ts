import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';

/**
 * Global HTTP Interceptor that catches all failed HTTP responses.
 * It parses the RFC 7807 ProblemDetails JSON returned by our ASP.NET Core API
 * and displays the error message safely in a toast notification.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred. Please try again later.';
      
      // If the API returned a ProblemDetails object with a 'detail' property (400, 401, 404, 500)
      if (error.error && typeof error.error === 'object' && error.error.detail) {
        errorMessage = error.error.detail;
      } 
      // If the API is entirely down or blocked by CORS
      else if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Is the API running?';
      } 
      // Fallback to generic HTTP client message
      else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show the message globally
      toastService.showError(errorMessage);
      
      // Re-throw so individual components can still handle it if necessary
      return throwError(() => error);
    })
  );
};
