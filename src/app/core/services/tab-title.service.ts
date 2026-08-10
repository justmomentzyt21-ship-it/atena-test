import { Injectable, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TabTitleService implements OnDestroy {
  private readonly messages = ['¡Volvé!', 'No te lo pierdas...'];
  private currentTitle = '';
  private messageIndex = 0;
  private intervalId?: ReturnType<typeof setInterval>;
  private isBrowser: boolean;
  private isHidden = false;

  private handleVisibilityChange = () => {
    if (this.document.hidden) {
      this.isHidden = true;
      this.messageIndex = 0;
      this.titleService.setTitle(this.messages[0]);

      this.intervalId = setInterval(() => {
        this.messageIndex = (this.messageIndex + 1) % this.messages.length;
        this.titleService.setTitle(this.messages[this.messageIndex]);
      }, 2000);
    } else {
      this.isHidden = false;
      if (this.intervalId) clearInterval(this.intervalId);
      this.titleService.setTitle(this.currentTitle); // el título real más reciente, no uno viejo
    }
  };

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    private titleService: Title,
    private router: Router,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  start() {
    if (!this.isBrowser) return;

    // Cada vez que termina una navegación, actualizamos qué título "real" hay que restaurar
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      // Si la pestaña está oculta en este momento, no pisamos con el título real todavía
      if (!this.isHidden) {
        this.currentTitle = this.document.title;
      }
    });

    // Captura también el título inicial al arrancar la app
    this.currentTitle = this.document.title;

    this.document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  ngOnDestroy() {
    if (!this.isBrowser) return;
    this.document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
