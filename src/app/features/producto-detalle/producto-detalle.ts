import {
  Component,
  Inject,
  OnInit,
  OnDestroy,
  signal,
  Renderer2,
  RendererFactory2,
} from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { PRODUCT_REPOSITORY, ProductRepository } from '../../core/tokens/product-repository.token';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart';
import { Spinner } from '../../shared/components/spinner/spinner';
import { optimizeCloudinaryUrl } from '../../core/utils/cloudinary.util';

interface ParsedDescription {
  intro: string;
  title: string;
  items: string[];
}

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, Spinner],
  templateUrl: './producto-detalle.html',
  styleUrl: './producto-detalle.scss',
})
export class ProductoDetalle implements OnInit, OnDestroy {
  product = signal<Product | undefined>(undefined);
  loading = signal(true);
  selectedModality = signal<'venta' | 'alquiler'>('venta');
  optimizedImage = signal('');
  descriptionParsed = signal<ParsedDescription>({ intro: '', title: '', items: [] });

  private renderer: Renderer2;
  private schemaScriptEl: HTMLScriptElement | null = null;

  constructor(
    private route: ActivatedRoute,
    @Inject(PRODUCT_REPOSITORY) private productRepo: ProductRepository,
    private cart: CartService,
    private titleService: Title,
    private metaService: Meta,
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;

    this.productRepo.getProductBySlug(slug).subscribe((product) => {
      this.product.set(product);
      this.loading.set(false);

      if (product) {
        this.optimizedImage.set(optimizeCloudinaryUrl(product.imageUrl, 800));
        this.selectedModality.set(product.type === 'alquiler' ? 'alquiler' : 'venta');
        this.descriptionParsed.set(this.parseDescription(product.description));
        this.setMetaTags(product);
        this.injectSchema(product);
      }
    });
  }

  ngOnDestroy() {
    this.removeSchema();
  }

  onModalityChange(value: string) {
    this.selectedModality.set(value as 'venta' | 'alquiler');
  }

  addToCart() {
    const p = this.product();
    if (p) this.cart.addItem(p, this.selectedModality());
  }

  /**
   * Convierte una descripción cargada en el Sheet como texto plano con
   * viñetas "•" en una estructura { intro, title, items } para poder
   * renderizarla como lista con formato en vez de párrafo plano.
   *
   * Soporta el formato:
   *   "CARACTERÍSTICAS
   *    • item uno.
   *    • item dos."
   *
   * Si el texto no tiene "•", se devuelve todo en "intro" y se muestra
   * como párrafo normal (fallback para descripciones simples).
   */
  private parseDescription(text: string | undefined): ParsedDescription {
    if (!text) return { intro: '', title: '', items: [] };

    if (!text.includes('•')) {
      return { intro: text.trim(), title: '', items: [] };
    }

    const [beforeBullets, ...rest] = text.split('•');
    const items = rest.map((item) => item.trim()).filter(Boolean);

    return {
      intro: '',
      title: beforeBullets.trim(),
      items,
    };
  }

  private injectSchema(product: Product) {
    this.removeSchema();

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.imageUrl,
      category: product.category,
    };

    const json = JSON.stringify(schema);

    const script = this.renderer.createElement('script') as HTMLScriptElement;
    this.renderer.setAttribute(script, 'type', 'application/ld+json');
    this.renderer.appendChild(script, this.renderer.createText(json));
    this.renderer.appendChild(this.document.head, script);
    this.schemaScriptEl = script;
  }

  private removeSchema() {
    if (this.schemaScriptEl) {
      this.renderer.removeChild(this.document.head, this.schemaScriptEl);
      this.schemaScriptEl = null;
    }
  }

  private setMetaTags(product: Product) {
    const title = `${product.name} | Grupo Atena`;
    const description =
      product.description ||
      `${product.name} - ${product.category}. Venta y alquiler de equipamiento médico en Grupo Atena.`;

    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({
      property: 'og:image',
      content: optimizeCloudinaryUrl(product.imageUrl, 1200),
    });
    this.metaService.updateTag({ property: 'og:type', content: 'product' });
  }
}
