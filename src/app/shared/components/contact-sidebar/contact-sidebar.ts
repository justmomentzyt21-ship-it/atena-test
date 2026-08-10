import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-sidebar.html',
  styleUrl: './contact-sidebar.scss',
})
export class ContactSidebar {
  private readonly phoneNumber = '5491131080788';
  private readonly email = 'Ventasatena@gmail.com';

  whatsappLink = `https://wa.me/${this.phoneNumber}`;
  mailtoLink = `mailto:${this.email}?subject=${encodeURIComponent('Consulta de productos - Grupo Atena')}`;
}
