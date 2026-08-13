import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, shareReplay, catchError, of, timeout, retry, timer, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { BannerRepository } from '../tokens/banner-repository.token';
import { Banner } from '../models/banner.model';
import { environment } from '../../../environments/environment';

const CACHE_DURATION_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 4000; // por intento individual
const RETRY_COUNT = 2; // reintentos ante fallos transitorios (ej: cold start puntual)
const RETRY_DELAY_MS = 1000; // espera antes de cada reintento
const ERROR_RETRY_MS = 30 * 1000;
const STORAGE_KEY = 'atena-banners-cache-v1';

@Injectable()
export class GoogleSheetsBannerAdapter implements BannerRepository {
  private cache$: Observable<Banner[]> | null = null;
  private cacheTimestamp = 0;
  private lastGoodValue: Banner[] | null = null;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.lastGoodValue = this.readFromStorage(); // al arrancar la app, ya intentamos precargar lo último bueno
  }

  getBanners(): Observable<Banner[]> {
    const now = Date.now();
    const cacheExpired = now - this.cacheTimestamp > CACHE_DURATION_MS;

    if (!this.cache$ || cacheExpired) {
      this.cacheTimestamp = now;
      const params = new HttpParams().set('recurso', 'banners');

      this.cache$ = this.http.get<any[]>(environment.productsApiUrl, { params }).pipe(
        timeout(REQUEST_TIMEOUT_MS),
        retry({ count: RETRY_COUNT, delay: () => timer(RETRY_DELAY_MS) }),
        map((rawData) => rawData.map((row) => this.mapToBanner(row))),
        tap((banners) => {
          this.lastGoodValue = banners;
          this.writeToStorage(banners);
        }),
        catchError((err) => {
          console.error('Error al obtener banners desde Google Sheets (tras reintentos):', err);
          this.cacheTimestamp = now - CACHE_DURATION_MS + ERROR_RETRY_MS;
          return of(this.lastGoodValue ?? ([] as Banner[]));
        }),
        shareReplay(1),
      );
    }

    return this.cache$;
  }

  private readFromStorage(): Banner[] | null {
    if (!this.isBrowser) return null; // SSR no tiene localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null; // JSON corrupto, cuota excedida, etc. — no rompemos la app por esto
    }
  }

  private writeToStorage(banners: Banner[]) {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
    } catch {
      // localStorage lleno o deshabilitado (modo privado en algunos navegadores) — no es crítico, seguimos con el caché en memoria nomás
    }
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
