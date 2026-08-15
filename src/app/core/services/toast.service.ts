import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  message = signal<string | null>(null);
  leaving = signal(false);

  private timeoutId?: ReturnType<typeof setTimeout>;
  private leaveTimeoutId?: ReturnType<typeof setTimeout>;
  private readonly LEAVE_DURATION_MS = 300;

  show(message: string, durationMs = 2000) {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.leaveTimeoutId) clearTimeout(this.leaveTimeoutId);

    this.leaving.set(false);
    this.message.set(message);

    this.timeoutId = setTimeout(() => {
      this.leaving.set(true);

      this.leaveTimeoutId = setTimeout(() => {
        this.message.set(null);
        this.leaving.set(false);
      }, this.LEAVE_DURATION_MS);
    }, durationMs);
  }
}
