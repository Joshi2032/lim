import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { CustomersComponent } from './customers/customers.component';
import { DeliveryComponent } from './delivery/delivery.component';
import { AssignmentsComponent } from './assignments/assignments.component';

type TabId = 'clientes' | 'entregas' | 'asignaciones';

interface TabItem {
  id: TabId;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, CustomersComponent, DeliveryComponent, AssignmentsComponent],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersComponent {
  activeTab: TabId = 'clientes';

  readonly tabs: TabItem[] = [
    { id: 'clientes', label: 'Clientes', icon: '👥' },
    { id: 'entregas', label: 'Entregas', icon: '🚚' },
    { id: 'asignaciones', label: 'Asignaciones', icon: '📋' }
  ];

  setActiveTab(tabId: string): void {
    this.activeTab = tabId as TabId;
  }
}
