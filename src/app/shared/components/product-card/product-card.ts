import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart';
import { RouterLink } from '@angular/router';
import { optimizeCloudinaryUrl } from '../../../core/utils/cloudinary.util';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  @Input({ required: true }) product!: Product;

  selectedModality = signal<'venta' | 'alquiler'>('venta');
  justAdded = signal(false);

  optimizedImage = '';

  constructor(private cart: CartService) {}

  ngOnInit() {
    this.optimizedImage = optimizeCloudinaryUrl(this.product.imageUrl, 400);
    if (this.product.type === 'alquiler') {
      this.selectedModality.set('alquiler');
    } else {
      this.selectedModality.set('venta');
    }
  }

  onModalityChange(value: string) {
    this.selectedModality.set(value as 'venta' | 'alquiler');
  }

  addToCart() {
    this.cart.addItem(this.product, this.selectedModality());
    this.justAdded.set(true);
    setTimeout(() => this.justAdded.set(false), 1500);
  }
}
