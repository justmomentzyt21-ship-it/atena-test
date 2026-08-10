import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LogoItem {
  src: string;
  alt: string;
}

@Component({
  selector: 'app-logo-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo-carousel.html',
  styleUrl: './logo-carousel.scss',
})
export class LogoCarousel {
  @Input({ required: true }) logos: LogoItem[] = [];
  @Input() itemWidth = 160;
  @Input() itemHeight = 90;
  @Input() durationSeconds = 25;

  get cssVars() {
    return {
      '--width': `${this.itemWidth}px`,
      '--height': `${this.itemHeight}px`,
      '--quantity': this.logos.length,
      '--duration': `${this.durationSeconds}s`,
    };
  }

  delayFor(index: number): string {
    return `calc((var(--duration) / var(--quantity)) * ${index} - var(--duration))`;
  }
}
