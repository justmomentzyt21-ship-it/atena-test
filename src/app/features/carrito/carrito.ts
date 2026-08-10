import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.scss',
})
export class Carrito {
  private readonly phoneNumber = '+541131080788';
  private readonly email = 'tomasrom.dev@gmail.com';

  constructor(public cart: CartService) {}

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

  toastMessage = signal<string | null>(null);

  private showToast(message: string) {
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }

  sendEmail() {
    window.location.href = this.cart.generateMailtoLink(this.email);

    if (this.cart.needsClipboardFallback()) {
      this.cart.copyMessageToClipboard().then((copied) => {
        if (copied) {
          this.showToast(
            'Tu consulta es larga — la copiamos al portapapeles. Pegala en el email con Ctrl+V.',
          );
        }
      });
    }
  }
}
