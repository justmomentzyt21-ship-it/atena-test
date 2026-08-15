import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.scss',
})
export class Carrito implements OnInit, OnDestroy {
  private readonly phoneNumber = '5491131080788';
  private readonly email = 'ventasatena@gmail.com';

  isMobile = signal(false);
  private isBrowser: boolean;
  private resizeHandler = () => this.checkIsMobile();

  constructor(
    public cart: CartService,
    private toast: ToastService,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.checkIsMobile();
      window.addEventListener('resize', this.resizeHandler);
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  private checkIsMobile() {
    this.isMobile.set(window.innerWidth <= 700);
  }

  increase(productId: string, modality: 'venta' | 'alquiler', current: number) {
    this.cart.updateQuantity(productId, modality, current + 1);
  }

  decrease(productId: string, modality: 'venta' | 'alquiler', current: number) {
    this.cart.updateQuantity(productId, modality, current - 1);
  }

  remove(productId: string, modality: 'venta' | 'alquiler') {
    this.cart.removeItem(productId, modality);
  }

  clearCart() {
    this.cart.clear();
  }

  sendWhatsApp() {
    window.open(this.cart.generateWhatsAppLink(this.phoneNumber), '_blank');
  }

  sendEmail() {
    window.location.href = this.cart.generateMailtoLink(this.email);
    this.toast.show('Se abrió tu app de correo con la consulta lista para enviar.');
  }
}
