import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, catchError, of, timeout, retry, timer, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { ProductRepository } from '../tokens/product-repository.token';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';
import { generateSlug } from '../utils/slug.util';

const CACHE_DURATION_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;
const RETRY_COUNT = 2;
const RETRY_DELAY_MS = 1000;
const ERROR_RETRY_MS = 30 * 1000;
const STORAGE_KEY = 'atena-products-cache-v1';

@Injectable()
export class GoogleSheetsProductAdapter implements ProductRepository {
  private cache$: Observable<Product[]> | null = null;
  private cacheTimestamp = 0;
  private lastGoodValue: Product[] | null = null;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.lastGoodValue = this.readFromStorage(); // al arrancar la app, ya intentamos precargar lo último bueno
  }

  getProducts(): Observable<Product[]> {
    const now = Date.now();
    const cacheExpired = now - this.cacheTimestamp > CACHE_DURATION_MS;

    if (!this.cache$ || cacheExpired) {
      this.cacheTimestamp = now;
      this.cache$ = this.http.get<any[]>(environment.productsApiUrl).pipe(
        timeout(REQUEST_TIMEOUT_MS),
        retry({ count: RETRY_COUNT, delay: () => timer(RETRY_DELAY_MS) }),
        map((rawData) => rawData.map((row) => this.mapToProduct(row))),
        tap((products) => {
          this.lastGoodValue = products;
          this.writeToStorage(products);
        }),
        catchError((err) => {
          console.error('Error al obtener productos (tras reintentos):', err);
          this.cacheTimestamp = now - CACHE_DURATION_MS + ERROR_RETRY_MS;
          return of(this.lastGoodValue ?? ([] as Product[]));
        }),
        shareReplay(1),
      );
    }

    return this.cache$;
  }

  getProductBySlug(slug: string): Observable<Product | undefined> {
    return this.getProducts().pipe(map((products) => products.find((p) => p.slug === slug)));
  }

  private readFromStorage(): Product[] | null {
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

  private writeToStorage(products: Product[]) {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch {
      // localStorage lleno o deshabilitado (modo privado en algunos navegadores) — no es crítico, seguimos con el caché en memoria nomás
    }
  }

  private mapToProduct(row: any): Product {
    return {
      id: row['id'],
      name: row['nombre'],
      slug: generateSlug(row['nombre']),
      category: row['categoria'],
      salePrice: row['precioVenta'],
      rentalPrice: row['precioAlquiler'],
      type: this.mapType(row['tipo']),
      description: row['descripcion'],
      imageUrl: row['imagen'],
      stock: row['stock'] ?? 0,
    };
  }

  private mapType(tipo: string): 'venta' | 'alquiler' | 'venta-alquiler' {
    if (tipo === 'Venta') return 'venta';
    if (tipo === 'Alquiler') return 'alquiler';
    return 'venta-alquiler';
  }
}
