import { Component, Inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
export class App {
  protected readonly title = signal('grupo-atena-web');

  constructor(
    @Inject(PRODUCT_REPOSITORY) private productRepo: ProductRepository,
    @Inject(BANNER_REPOSITORY) private bannerRepo: BannerRepository,
    private tabTitle: TabTitleService,
  ) {}
  ngOnInit() {
    // dispara el fetch en segundo plano, sin bloquear nada visualmente
    this.productRepo.getProducts().subscribe();
    this.bannerRepo.getBanners().subscribe();
    this.tabTitle.start();
  }
}
