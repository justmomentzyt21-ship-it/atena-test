import { Component, Inject, Input, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../../core/tokens/product-repository.token';
import { Product } from '../../../core/models/product.model';
import { ProductCard } from '../product-card/product-card';
import { Spinner } from '../spinner/spinner';
import { BannerCarousel } from '../banner-carousel/banner-carousel';
import { HowItWorks } from '../how-it-works/how-it-works';
import { ContactSidebar } from '../contact-sidebar/contact-sidebar';

@Component({
  selector: 'app-catalogo-view',
  standalone: true,
  imports: [CommonModule, ProductCard, Spinner, BannerCarousel, HowItWorks, ContactSidebar],
  templateUrl: './catalogo-view.html',
  styleUrl: './catalogo-view.scss',
})
export class CatalogoView implements OnInit {
  @Input({ required: true }) type!: 'venta' | 'alquiler';

  private allProducts = signal<Product[]>([]);
  selectedCategory = signal<string>('Todos los equipos');
  searchTerm = signal<string>('');
  loading = signal<boolean>(true);

  // Solo los productos que corresponden a esta pantalla (venta o alquiler)
  productsForType = computed(() => {
    return this.allProducts().filter((p) => p.type === this.type || p.type === 'venta-alquiler');
  });

  categories = computed(() => {
    const cats = new Set(this.productsForType().map((p) => p.category));
    return ['Todos los equipos', ...Array.from(cats).sort()];
  });

  filteredProducts = computed(() => {
    const category = this.selectedCategory();
    const term = this.searchTerm().trim().toLowerCase();

    return this.productsForType().filter((product) => {
      const matchesCategory = category === 'Todos los equipos' || product.category === category;
      const matchesSearch = !term || product.name.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  });

  constructor(@Inject(PRODUCT_REPOSITORY) private productRepo: ProductRepository) {}

  ngOnInit() {
    this.productRepo.getProducts().subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando catálogo:', err);
        this.loading.set(false);
      },
    });
  }

  categoryMenuOpen = signal(false);

  toggleCategoryMenu() {
    this.categoryMenuOpen.update((open) => !open);
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
    this.categoryMenuOpen.set(false); // se cierra solo al elegir, cómodo en mobile
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
  }
}
