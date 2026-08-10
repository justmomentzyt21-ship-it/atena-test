import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.scss',
})
export class HowItWorks {
  private screenInput = signal<'venta' | 'alquiler'>('venta');

  @Input() set screen(value: 'venta' | 'alquiler') {
    this.screenInput.set(value);
  }

  title = computed(() =>
    this.screenInput() === 'alquiler'
      ? '¿Cómo alquilar el equipo ideal?'
      : '¿Cómo comprar el equipo ideal?',
  );

  subtitle =
    'Agregá los productos que te interesan y recibí una cotización personalizada de nuestro equipo. La compra se coordina directamente con vos, fuera de la web.';

  steps = [
    {
      number: 1,
      title: 'Elegí',
      subtitle: 'Explorá nuestro catálogo',
      description: 'Encontrá los productos que necesitás.',
    },
    {
      number: 2,
      title: 'Agregá',
      subtitle: 'Sumalos al carrito',
      description: 'Seleccioná todos los productos que quieras consultar.',
    },
    {
      number: 3,
      title: 'Enviá',
      subtitle: 'Recibí tu cotización',
      description:
        'Enviá tu consulta por WhatsApp o Email y un asesor se pondrá en contacto con vos.',
    },
  ];
}
