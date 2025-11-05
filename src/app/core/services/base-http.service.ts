import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';

export abstract class BaseHttpService {
  protected http = inject(HttpClient);

  protected abstract apiPath: string;

  protected get apiUrl(): string {
    return `${environment.apiUrl}${this.apiPath}`;
  }

  protected handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error (${error.status}): ${error.message}`;
    }

    console.error('HTTP Error:', {
      status: error.status,
      message: errorMessage,
      error: error.error,
    });

    return throwError(() => new Error(errorMessage));
  }

  protected get<T>(endpoint: string = ''): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http.get<T>(url).pipe(catchError(this.handleError.bind(this)));
  }

  protected post<T>(endpoint: string = '', data: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http.post<T>(url, data).pipe(catchError(this.handleError.bind(this)));
  }

  protected put<T>(endpoint: string = '', data: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http.put<T>(url, data).pipe(catchError(this.handleError.bind(this)));
  }

  protected patch<T>(endpoint: string = '', data: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http.patch<T>(url, data).pipe(catchError(this.handleError.bind(this)));
  }

  protected delete<T>(endpoint: string = ''): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http.delete<T>(url).pipe(catchError(this.handleError.bind(this)));
  }
}
