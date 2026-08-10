import { Component } from '@angular/core';

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  templateUrl: './whatsapp-button.html',
  styleUrl: './whatsapp-button.scss',
})
export class WhatsappButton {
  readonly phoneNumber = '+541131080788';

  get whatsappUrl(): string {
    return `https://wa.me/${this.phoneNumber}`;
  }
}
