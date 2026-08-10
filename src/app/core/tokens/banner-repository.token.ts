import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Banner } from '../models/banner.model';

export interface BannerRepository {
  getBanners(): Observable<Banner[]>;
}

export const BANNER_REPOSITORY = new InjectionToken<BannerRepository>('BannerRepository');
