import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.scss',
})
export class Contacto {
  address = 'Cerrito 2018, Bernal Oeste, Provincia de Buenos Aires';
  phone = '+54 9 11 3108 0788';
  phoneLink = '5491131080788';
  email = 'Ventasatena@gmail.com';
  mapSrc: SafeResourceUrl;
  instagramUser = 'grupoatena.med';

  constructor(private sanitizer: DomSanitizer) {
    this.mapSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://maps.google.com/maps?output=embed&q=Cerrito%202018%2C%20Bernal%Oeste%2C%20Provincia%20Buenos%20Aires&z=15&t=m',
    );
  }
}
