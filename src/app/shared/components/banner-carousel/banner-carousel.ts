import {
  Component,
  Inject,
  Input,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  signal,
  computed,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { BANNER_REPOSITORY, BannerRepository } from '../../../core/tokens/banner-repository.token';
import { optimizeCloudinaryUrl } from '../../../core/utils/cloudinary.util';

interface BannerSlide {
  imageUrl: string;
  imageMobileUrl: string;
  name: string;
}

@Component({
  selector: 'app-banner-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner-carousel.html',
  styleUrl: './banner-carousel.scss',
})
export class BannerCarousel implements OnInit, OnDestroy {
  @Input() screen: 'Ventas' | 'Alquiler' = 'Ventas';

  private rawSlides = signal<BannerSlide[]>([]);
  currentIndex = signal(0);
  isMobile = signal(false);

  slides = computed(() =>
    this.rawSlides().map((s) => ({
      imageUrl: this.isMobile() ? s.imageMobileUrl : s.imageUrl,
      name: s.name,
    })),
  );

  private intervalId?: ReturnType<typeof setInterval>;
  private isBrowser: boolean;
  private resizeHandler = () => this.checkIsMobile();

  constructor(
    @Inject(BANNER_REPOSITORY) private bannerRepo: BannerRepository,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.checkIsMobile();
      window.addEventListener('resize', this.resizeHandler);
    }

    this.bannerRepo.getBanners().subscribe((banners) => {
      const filtered = banners
        .filter((b) => b.screen === 'Ambos' || b.screen === this.screen)
        .map((b) => ({
          imageUrl: optimizeCloudinaryUrl(b.imageUrl, 1400, '5:1'),
          imageMobileUrl: optimizeCloudinaryUrl(b.imageMobileUrl, 900, '3:4'),
          name: b.name,
        }));
      this.rawSlides.set(filtered);

      if (filtered.length > 1) {
        this.startAutoplay();
      }
    });
  }

  private checkIsMobile() {
    this.isMobile.set(window.innerWidth <= 700);
  }

  goTo(index: number) {
    this.currentIndex.set(index);
    this.restartAutoplay();
  }

  next() {
    const total = this.slides().length;
    if (total === 0) return;
    this.currentIndex.set((this.currentIndex() + 1) % total);
  }

  prev() {
    const total = this.slides().length;
    if (total === 0) return;
    this.currentIndex.set((this.currentIndex() - 1 + total) % total);
  }

  private startAutoplay() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.next(), 5000);
  }

  private restartAutoplay() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.startAutoplay();
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.isBrowser) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }
}
