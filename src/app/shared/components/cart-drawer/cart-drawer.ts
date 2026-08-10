import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.scss',
})
export class CartDrawer {
  constructor(public cart: CartService) {}

  @HostListener('document:keydown.escape')
  onEscape() {
    this.cart.closeDrawer();
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

  goToCart() {
    this.cart.closeDrawer();
  }
}
