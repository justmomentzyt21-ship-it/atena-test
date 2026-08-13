import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

interface LeadPayload {
  tipo: 'CV' | 'Distribuidor';
  nombre: string;
  email: string;
  detalle: string;
  honeypot?: string;
}

@Injectable({ providedIn: 'root' })
export class LeadSubmissionService {
  constructor(private http: HttpClient) {}

  submit(payload: LeadPayload) {
    return this.http
      .post(environment.productsApiUrl, JSON.stringify(payload), {
        headers: { 'Content-Type': 'text/plain' },
        responseType: 'text',
      })
      .pipe(
        catchError((err) => {
          console.warn('No se pudo guardar el lead en el Sheet (no bloqueante):', err);
          return of(null);
        }),
      );
  }
}
