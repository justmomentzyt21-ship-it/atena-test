import { Component, Inject, PLATFORM_ID, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';
import { PRODUCT_REPOSITORY, ProductRepository } from './core/tokens/product-repository.token';
import { BANNER_REPOSITORY, BannerRepository } from './core/tokens/banner-repository.token';
import { CartDrawer } from './shared/components/cart-drawer/cart-drawer';
import { TabTitleService } from './core/services/tab-title.service';
import { WhatsappButton } from './shared/components/whatsapp-button/whatsapp-button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, CartDrawer, WhatsappButton],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('grupo-atena-web');

  constructor(
    @Inject(PRODUCT_REPOSITORY) private productRepo: ProductRepository,
    @Inject(BANNER_REPOSITORY) private bannerRepo: BannerRepository,
    private tabTitle: TabTitleService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.productRepo.getProducts().subscribe({
        next: () => {},
        error: (err) => console.warn('Prefetch de productos falló (no bloqueante):', err),
      });
      this.bannerRepo.getBanners().subscribe({
        next: () => {},
        error: (err) => console.warn('Prefetch de banners falló (no bloqueante):', err),
      });
    }

    this.tabTitle.start();
  }
}
