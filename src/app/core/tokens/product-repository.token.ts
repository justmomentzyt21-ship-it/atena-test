import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

export interface ProductRepository {
  getProducts(): Observable<Product[]>;
  getProductBySlug(slug: string): Observable<Product | undefined>;
}

export const PRODUCT_REPOSITORY = new InjectionToken<ProductRepository>('ProductRepository');
