import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-servicio-tecnico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './servicio-tecnico.html',
  styleUrl: './servicio-tecnico.scss',
})
export class ServicioTecnico implements OnInit {
  private readonly phoneNumber = '5491131080788';

  equipmentInput = signal('');
  problemInput = signal('');
  touched = signal(false);

  isFormValid = () =>
    this.equipmentInput().trim().length >= 3 && this.problemInput().trim().length >= 5;

  services = [
    {
      title: 'Mantenimiento preventivo',
      description:
        'Revisiones periódicas para anticipar fallas y asegurar el correcto funcionamiento de tus equipos.',
      icon: 'shield',
      image: '/images/servicio-tecnico/i (3).png',
    },
    {
      title: 'Reparación y sustitución',
      description:
        'Diagnóstico y reparación de equipamiento médico, con sustitución de piezas cuando sea necesario.',
      icon: 'wrench',
      image: '/images/servicio-tecnico/i (2).png',
    },
    {
      title: 'Repuestos originales',
      description: 'Gestión y provisión de repuestos de las principales marcas del mercado.',
      icon: 'box',
      image: '/images/servicio-tecnico/i (1).png',
    },
    {
      title: 'Validaciones y calibración',
      description:
        'Validación técnica de equipos para asegurar precisión y cumplimiento de normativas.',
      icon: 'check',
      image: '/images/servicio-tecnico/i (4).png',
    },
  ];

  constructor(
    private titleService: Title,
    private metaService: Meta,
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Servicio Técnico | Medicsur - Grupo Atena');
    this.metaService.updateTag({
      name: 'description',
      content:
        'Servicio técnico especializado en equipamiento médico y hospitalario. Mantenimiento, reparación, repuestos y validaciones. Medicsur - Soluciones Médicas Integrales.',
    });
  }

  onEquipmentChange(value: string) {
    this.equipmentInput.set(value);
  }

  onProblemChange(value: string) {
    this.problemInput.set(value);
  }

  sendWhatsApp() {
    if (!this.isFormValid()) {
      this.touched.set(true);
      return;
    }

    const message = [
      'Hola! Necesito asistencia técnica para el siguiente equipo: ',
      '',
      `Equipo: ${this.equipmentInput()}`,
      `Problema/consulta: ${this.problemInput()}`,
      '',
      'Nombre y apellido:',
      'Muchas gracias!',
    ].join('\n');

    const link = `https://wa.me/${this.phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(link, '_blank');
  }
}
