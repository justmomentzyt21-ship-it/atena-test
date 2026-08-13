import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  message = signal<string | null>(null);
  private timeoutId?: ReturnType<typeof setTimeout>;

  show(message: string, durationMs = 4000) {
    this.message.set(message);
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.message.set(null), durationMs);
  }
}
