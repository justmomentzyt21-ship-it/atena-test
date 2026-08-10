import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { BannerRepository } from '../tokens/banner-repository.token';
import { Banner } from '../models/banner.model';
import { environment } from '../../../environments/environment';

const CACHE_DURATION_MS = 2 * 60 * 1000;

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
        map((rawData) => rawData.map((row) => this.mapToBanner(row))),
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
      screen: row['pantalla'],
    };
  }
}
