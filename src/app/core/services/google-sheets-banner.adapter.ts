import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, shareReplay, catchError, of, timeout, retry, timer } from 'rxjs';
import { BannerRepository } from '../tokens/banner-repository.token';
import { Banner } from '../models/banner.model';
import { environment } from '../../../environments/environment';

const CACHE_DURATION_MS = 2 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 4000; // por request individual — el script responde en <1.5s cuando anda bien
const RETRY_COUNT = 2;

@Injectable()
export class GoogleSheetsBannerAdapter implements BannerRepository {
  private cache$: Observable<Banner[]> | null = null;
  private cacheTimestamp = 0;

  constructor(private http: HttpClient) {}

  getBanners(): Observable<Banner[]> {
    const now = Date.now();
    const cacheExpired = now - this.cacheTimestamp > CACHE_DURATION_MS;

    if (!this.cache$ || cacheExpired) {
      this.cacheTimestamp = now;
      const params = new HttpParams().set('recurso', 'banners');

      this.cache$ = this.http.get<any[]>(environment.productsApiUrl, { params }).pipe(
        timeout(REQUEST_TIMEOUT_MS),
        retry({
          count: RETRY_COUNT,
          delay: (error, retryCount) => {
            console.warn(`Reintentando banners (intento ${retryCount})...`, error);
            return timer(retryCount * 500); // espera 500ms, luego 1000ms
          },
        }),
        map((rawData) => rawData.map((row) => this.mapToBanner(row))),
        catchError((err) => {
          console.error('Error al obtener banners desde Google Sheets (tras reintentos):', err);
          this.cacheTimestamp = 0;
          this.cache$ = null;
          return of([] as Banner[]);
        }),
        shareReplay(1),
      );
    }

    return this.cache$;
  }

  private mapToBanner(row: any): Banner {
    return {
      order: row['orden'],
      name: row['nombre'],
      imageUrl: row['imagen'],
      imageMobileUrl: row['imagenMobile'],
      screen: row['pantalla'],
    };
  }
}
