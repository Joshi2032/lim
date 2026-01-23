import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export type StatVariant = 'default' | 'red' | 'amber' | 'blue' | 'green' | 'purple';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss'
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() subtitle = '';
  @Input() trendLabel = '';
  @Input() trendDirection: 'up' | 'down' | '' = '';
  @Input() set iconSvg(value: string) {
    this._iconSvg = value;
    this.iconSvgSafe = value ? this.sanitizer.bypassSecurityTrustHtml(value) : '';
  }
  @Input() variant: StatVariant = 'default';

  iconSvgSafe: SafeHtml | '' = '';
  private _iconSvg = '';
  constructor(private sanitizer: DomSanitizer) {}
}
