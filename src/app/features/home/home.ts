import {
  Component,
  ElementRef,
  Inject,
  PLATFORM_ID,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LogoCarousel, LogoItem } from '../../shared/components/logo-carousel/logo-carousel';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, LogoCarousel],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  @ViewChildren('brandCard') brandCards!: QueryList<ElementRef<HTMLElement>>;

  visibleCards = signal<Set<number>>(new Set());
  brands = [
    {
      name: 'Atena Dana Yasmin',
      logo: '/images/brands/dana-yasmin-logo.png',
      tag: 'Ventas',
      title: 'Ventas / Importaciones',
      description:
        'Experiencia y agilidad en importación médica. Equipamiento de las mejores marcas del mercado.',
      link: '/ventas',
      cta: 'Ver catálogo de ventas',
      accent: '#d4a63e',
    },
    {
      name: 'Atena Full Care',
      logo: '/images/brands/full-care-logo.png',
      tag: 'Alquiler',
      title: 'Alquiler de Equipamiento',
      description:
        'Alquiler de equipamiento médico y hospitalario, con soluciones flexibles para cada necesidad.',
      link: '/distribucion-alquiler',
      cta: 'Ver catálogo de alquiler',
      accent: '#3f8f7a',
    },
    {
      name: 'Medicsur',
      logo: '/images/brands/medicsur-logo.png',
      tag: 'Mantenimiento',
      title: 'Servicio Técnico',
      description:
        'Servicio técnico especializado en equipamiento médico y hospitalario, con asesoramiento e instalación incluidos.',
      link: '/servicio-tecnico',
      cta: 'Conocer el servicio',
      accent: '#1c3f6e',
    },
  ];

  // Reemplazar por los logos reales de hospitales. Ubicar en /public/images/hospitals/
  hospitalLogos: LogoItem[] = [
    { src: '/images/hospitals/logo1.png', alt: 'Hospital 1' },
    { src: '/images/hospitals/logo2.jpg', alt: 'Hospital 2' },
    { src: '/images/hospitals/logo3.png', alt: 'Hospital 3' },
    { src: '/images/hospitals/logo4.jpg', alt: 'Hospital 4' },
    { src: '/images/hospitals/logo5.jpg', alt: 'Hospital 5' },
    { src: '/images/hospitals/logo2 - copia.jpg', alt: 'Hospital 6' },
    { src: '/images/hospitals/logo3 - copia.png', alt: 'Hospital 7' },
    { src: '/images/hospitals/logo4 - copia.jpg', alt: 'Hospital 8' },
    { src: '/images/hospitals/logo3 - copia.png', alt: 'Hospital 7' },
    { src: '/images/hospitals/logo4 - copia.jpg', alt: 'Hospital 8' },
  ];

  ngOnInit() {
    this.titleService.setTitle('Grupo Atena | Equipamiento medico');
    this.metaService.updateTag({
      name: 'description',
      content:
        'Venta, alquiler y servicio técnico de equipamiento médico. Más de 30 años de trayectoria familiar.',
    });
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return; // el servidor no tiene IntersectionObserver

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset['index']);
            this.visibleCards.update((set) => {
              const next = new Set(set);
              next.add(index);
              return next;
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 },
    );

    // Esperamos el primer scroll antes de empezar a observar, así las cards
    // que ya están dentro del viewport al cargar no se disparan solas.
    const startObserving = () => {
      this.brandCards.forEach((card) => observer.observe(card.nativeElement));
      window.removeEventListener('scroll', startObserving);
    };

    window.addEventListener('scroll', startObserving, { passive: true });
  }
}
