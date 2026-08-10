import { Component, Inject, Input, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BANNER_REPOSITORY, BannerRepository } from '../../../core/tokens/banner-repository.token';
import { optimizeCloudinaryUrl } from '../../../core/utils/cloudinary.util';

@Component({
  selector: 'app-banner-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner-carousel.html',
  styleUrl: './banner-carousel.scss',
})
export class BannerCarousel implements OnInit, OnDestroy {
  @Input() screen: 'Ventas' | 'Alquiler' = 'Ventas';

  slides = signal<{ imageUrl: string; name: string }[]>([]);
  currentIndex = signal(0);

  private intervalId?: ReturnType<typeof setInterval>;

  constructor(@Inject(BANNER_REPOSITORY) private bannerRepo: BannerRepository) {}

  ngOnInit() {
    this.bannerRepo.getBanners().subscribe((banners) => {
      const filtered = banners
        .filter((b) => b.screen === 'Ambos' || b.screen === this.screen)
        .map((b) => ({
          imageUrl: optimizeCloudinaryUrl(b.imageUrl, 1400, '4:1'),
          name: b.name,
        }));
      this.slides.set(filtered);

      if (filtered.length > 1) {
        this.startAutoplay();
      }
    });
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
  }
}
