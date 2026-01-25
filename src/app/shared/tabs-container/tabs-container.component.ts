import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TabItem {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-tabs-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs-container.component.html',
  styleUrls: ['./tabs-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsContainerComponent {
  @Input() tabs: TabItem[] = [];
  @Input() activeTab: string = '';
  @Input() onTabChange!: (tabId: string) => void;

  selectTab(tabId: string): void {
    this.onTabChange?.(tabId);
  }
}
