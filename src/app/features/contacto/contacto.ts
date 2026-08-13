import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LeadSubmissionService } from '../../core/services/lead-submission.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.scss',
})
export class Contacto implements OnInit, OnDestroy {
  address = 'Cerrito 2018, Bernal, Pcia. Bs. As.';
  phone = '+54 9 11 3108 0788';
  phoneLink = '5491131080788';
  email = 'ventasatena@gmail.com';
  instagramUser = 'grupoatena.med';
  mapSrc: SafeResourceUrl;

  private readonly phoneNumber = '5491131080788';

  isMobile = signal(false);
  private isBrowser: boolean;
  private resizeHandler = () => this.checkIsMobile();

  cvName = signal('');
  cvEmail = signal('');
  cvPosition = signal('');
  cvLink = signal('');
  cvHoneypot = signal('');
  cvTouched = signal(false);

  isCvFormValid = () =>
    this.cvName().trim().length >= 3 &&
    this.cvEmail().trim().length >= 5 &&
    this.cvLink().trim().length >= 5;

  distName = signal('');
  distCompany = signal('');
  distEmail = signal('');
  distZone = signal('');
  distMessage = signal('');
  distHoneypot = signal('');
  distTouched = signal(false);

  isDistFormValid = () =>
    this.distName().trim().length >= 3 &&
    this.distEmail().trim().length >= 5 &&
    this.distZone().trim().length >= 2;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private sanitizer: DomSanitizer,
    private leadSubmission: LeadSubmissionService,
    private toast: ToastService,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.mapSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://maps.google.com/maps?output=embed&q=Cerrito%202018%2C%20Bernal%2C%20Pcia%20Bs.%20As.&z=15&t=m',
    );
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.checkIsMobile();
      window.addEventListener('resize', this.resizeHandler);
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  private checkIsMobile() {
    this.isMobile.set(window.innerWidth <= 700);
  }

  private canSubmit(key: string, cooldownMs = 60000): boolean {
    if (!this.isBrowser) return true;
    const last = localStorage.getItem(key);
    if (last && Date.now() - Number(last) < cooldownMs) return false;
    localStorage.setItem(key, String(Date.now()));
    return true;
  }

  private buildCvMessage(): string {
    return [
      'Hola! Quisiera postularme poder para trabajar en Grupo Atena.',
      '',
      `Nombre y apellido: ${this.cvName()}`,
      `Email: ${this.cvEmail()}`,
      `Puesto de interés: ${this.cvPosition() || 'No especificado'}`,
      `CV / Portfolio: ${this.cvLink()}`,
      '',
      'Muchas gracias!',
    ].join('\n');
  }

  private submitCvLead() {
    if (this.cvHoneypot()) return;
    this.leadSubmission
      .submit({
        tipo: 'CV',
        nombre: this.cvName(),
        email: this.cvEmail(),
        detalle: `Puesto: ${this.cvPosition() || '-'} | CV: ${this.cvLink()}`,
        honeypot: this.cvHoneypot(),
      })
      .subscribe();
  }

  sendCvWhatsApp() {
    if (this.cvHoneypot()) return;
    if (!this.isCvFormValid()) {
      this.cvTouched.set(true);
      return;
    }
    if (!this.canSubmit('cv-form-cooldown')) {
      this.toast.show('Ya enviaste tu consulta. Esperá un momento antes de volver a intentar.');
      return;
    }

    this.submitCvLead();
    const link = `https://wa.me/${this.phoneNumber}?text=${encodeURIComponent(this.buildCvMessage())}`;
    window.open(link, '_blank');
    this.toast.show('¡Listo! Te llevamos a WhatsApp para enviar tu consulta.');
  }

  sendCvEmail() {
    if (this.cvHoneypot()) return;
    if (!this.isCvFormValid()) {
      this.cvTouched.set(true);
      return;
    }
    if (!this.canSubmit('cv-form-cooldown')) {
      this.toast.show('Ya enviaste tu consulta. Esperá un momento antes de volver a intentar.');
      return;
    }

    this.submitCvLead();
    const subject = 'Postulación laboral - Grupo Atena';
    const link = `mailto:${this.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(this.buildCvMessage())}`;
    window.location.href = link;
  }

  onCvNameChange(v: string) {
    this.cvName.set(v);
  }
  onCvEmailChange(v: string) {
    this.cvEmail.set(v);
  }
  onCvPositionChange(v: string) {
    this.cvPosition.set(v);
  }
  onCvLinkChange(v: string) {
    this.cvLink.set(v);
  }
  onCvHoneypotChange(v: string) {
    this.cvHoneypot.set(v);
  }

  private buildDistMessage(): string {
    return [
      'Hola! Estoy interesado/a en ser distribuidor de Grupo Atena.',
      '',
      `Nombre: ${this.distName()}`,
      `Empresa: ${this.distCompany() || 'No especificado'}`,
      `Email: ${this.distEmail()}`,
      `Zona / Provincia: ${this.distZone()}`,
      `Mensaje: ${this.distMessage() || '-'}`,
      '',
      'Muchas gracias!',
    ].join('\n');
  }

  private submitDistLead() {
    if (this.distHoneypot()) return;
    this.leadSubmission
      .submit({
        tipo: 'Distribuidor',
        nombre: this.distName(),
        email: this.distEmail(),
        detalle: `Empresa: ${this.distCompany() || '-'} | Zona: ${this.distZone()} | Mensaje: ${this.distMessage() || '-'}`,
        honeypot: this.distHoneypot(),
      })
      .subscribe();
  }

  sendDistWhatsApp() {
    if (this.distHoneypot()) return;
    if (!this.isDistFormValid()) {
      this.distTouched.set(true);
      return;
    }
    if (!this.canSubmit('dist-form-cooldown')) {
      this.toast.show('Ya enviaste tu consulta. Esperá un momento antes de volver a intentar.');
      return;
    }

    this.submitDistLead();
    const link = `https://wa.me/${this.phoneNumber}?text=${encodeURIComponent(this.buildDistMessage())}`;
    window.open(link, '_blank');
    this.toast.show('¡Listo! Te llevamos a WhatsApp para enviar tu consulta.');
  }

  sendDistEmail() {
    if (this.distHoneypot()) return;
    if (!this.isDistFormValid()) {
      this.distTouched.set(true);
      return;
    }
    if (!this.canSubmit('dist-form-cooldown')) {
      this.toast.show('Ya enviaste tu consulta. Esperá un momento antes de volver a intentar.');
      return;
    }

    this.submitDistLead();
    const subject = 'Consulta de distribución - Grupo Atena';
    const link = `mailto:${this.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(this.buildDistMessage())}`;
    window.location.href = link;
  }

  onDistNameChange(v: string) {
    this.distName.set(v);
  }
  onDistCompanyChange(v: string) {
    this.distCompany.set(v);
  }
  onDistEmailChange(v: string) {
    this.distEmail.set(v);
  }
  onDistZoneChange(v: string) {
    this.distZone.set(v);
  }
  onDistMessageChange(v: string) {
    this.distMessage.set(v);
  }
  onDistHoneypotChange(v: string) {
    this.distHoneypot.set(v);
  }
}
