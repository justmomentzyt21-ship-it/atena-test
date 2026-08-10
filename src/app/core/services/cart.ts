import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart-item.model';

const STORAGE_KEY = 'grupo-atena-carrito';

@Injectable({ providedIn: 'root' })
export class CartService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private items = signal<CartItem[]>(this.loadFromStorage());

  readonly cartItems = this.items.asReadonly();

  itemCount = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));

  addItem(product: Product, modality: 'venta' | 'alquiler') {
    const current = this.items();
    const existing = current.find((i) => i.product.id === product.id && i.modality === modality);

    if (existing) {
      const nextQty = existing.quantity + 1;
      const cappedQty = product.stock > 0 ? Math.min(nextQty, product.stock) : nextQty;
      this.updateQuantity(product.id, modality, cappedQty);
    } else {
      this.items.set([...current, { product, quantity: 1, modality }]);
      this.saveToStorage();
    }
  }

  removeItem(productId: string, modality: 'venta' | 'alquiler') {
    this.items.set(
      this.items().filter((i) => !(i.product.id === productId && i.modality === modality)),
    );
    this.saveToStorage();
  }

  updateQuantity(productId: string, modality: 'venta' | 'alquiler', quantity: number) {
    if (quantity <= 0) {
      this.removeItem(productId, modality);
      return;
    }

    const item = this.items().find((i) => i.product.id === productId && i.modality === modality);
    const maxAllowed = item && item.product.stock > 0 ? item.product.stock : quantity;
    const finalQty = Math.min(quantity, maxAllowed);

    this.items.set(
      this.items().map((i) =>
        i.product.id === productId && i.modality === modality ? { ...i, quantity: finalQty } : i,
      ),
    );
    this.saveToStorage();
  }

  clear() {
    this.items.set([]);
    this.saveToStorage();
  }

  generateWhatsAppLink(phoneNumber: string): string {
    const message = this.buildMessage();
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  }

  generateMailtoLink(email: string): string {
    const subject = 'Consulta de productos - Grupo Atena';
    const fullBody = this.buildMessage();
    const encoded = encodeURIComponent(fullBody);

    const SAFE_LIMIT = 3500;

    if (encoded.length < SAFE_LIMIT) {
      return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encoded}`;
    }

    const shortBody =
      'Hola! Te escribo con una consulta de varios productos. Ya la copié a tu portapapeles — pegala acá abajo (Ctrl+V):\n\n';
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shortBody)}`;
  }

  needsClipboardFallback(): boolean {
    return encodeURIComponent(this.buildMessage()).length >= 3500;
  }

  copyMessageToClipboard(): Promise<boolean> {
    return navigator.clipboard
      .writeText(this.buildMessage())
      .then(() => true)
      .catch(() => false);
  }

  private buildMessage(): string {
    const lines = ['Hola! Quisiera consultar por los siguientes productos:', ''];

    this.items().forEach((item, i) => {
      const modalidadTexto = item.modality === 'venta' ? 'Venta' : 'Alquiler';
      const stockTexto = item.product.stock === 0 ? ' [SIN STOCK - consultar disponibilidad]' : '';
      lines.push(
        `${i + 1}. ${item.product.name} (${modalidadTexto}) x${item.quantity}${stockTexto}`,
      );
    });

    lines.push(
      '',
      'Mis datos:',
      'Nombre y apellido: [Completar]',
      'CUIL: [Completar]',
      '',
      'Muchas gracias!',
    );

    return lines.join('\n');
  }

  private loadFromStorage(): CartItem[] {
    if (!this.isBrowser) return []; // el servidor no tiene localStorage

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage() {
    if (!this.isBrowser) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
  }

  isDrawerOpen = signal(false);

  openDrawer() {
    this.isDrawerOpen.set(true);
  }

  closeDrawer() {
    this.isDrawerOpen.set(false);
  }

  toggleDrawer() {
    this.isDrawerOpen.update((open) => !open);
  }
}
