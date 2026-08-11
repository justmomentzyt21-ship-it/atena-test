import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, catchError, of, timeout } from 'rxjs';
import { ProductRepository } from '../tokens/product-repository.token';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';
import { generateSlug } from '../utils/slug.util';

const CACHE_DURATION_MS = 2 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000; // no esperar indefinidamente a Apps Script

@Injectable()
export class GoogleSheetsProductAdapter implements ProductRepository {
  private cache$: Observable<Product[]> | null = null;
  private cacheTimestamp = 0;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    const now = Date.now();
    const cacheExpired = now - this.cacheTimestamp > CACHE_DURATION_MS;

    if (!this.cache$ || cacheExpired) {
      this.cacheTimestamp = now;
      this.cache$ = this.http.get<any[]>(environment.productsApiUrl).pipe(
        timeout(REQUEST_TIMEOUT_MS),
        map((rawData) => rawData.map((row) => this.mapToProduct(row))),
        catchError((err) => {
          console.error('Error al obtener productos desde Google Sheets:', err);
          this.cacheTimestamp = 0; // no cachear el fallo, para reintentar en la próxima llamada
          this.cache$ = null;
          return of([] as Product[]); // fallback: lista vacía en vez de colgar la app
        }),
        shareReplay(1),
      );
    }

    return this.cache$;
  }

  getProductBySlug(slug: string): Observable<Product | undefined> {
    return this.getProducts().pipe(map((products) => products.find((p) => p.slug === slug)));
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
