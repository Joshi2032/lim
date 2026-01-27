import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { PageHeaderComponent, PageAction } from '../../shared/page-header/page-header.component';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { SearchInputComponent } from '../../shared/search-input/search-input.component';

export type PeriodType = 'day' | 'month' | 'year';
export type OrderType = 'mesa' | 'entrega' | 'todos';

export interface IncomeRecord {
  id: string;
  date: Date;
  orderNumber: string;
  type: 'mesa' | 'entrega';
  items: string[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia';
  customer?: string;
}

export interface PeriodSummary {
  period: string;
  total: number;
  orders: number;
  average: number;
  percentage: number;
}

@Component({
  selector: 'app-income-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    PageHeaderComponent,
    SectionHeaderComponent,
    SearchInputComponent
  ],
  templateUrl: './income-report.component.html',
  styleUrl: './income-report.component.scss'
})
export class IncomeReportComponent implements OnInit {
  @Input() embedded: boolean = false;

  // Filters
  periodType: PeriodType = 'day';
  orderType: OrderType = 'todos';
  startDate: string = '';
  endDate: string = '';
  searchQuery: string = '';

  // Data
  incomeRecords: IncomeRecord[] = [];
  filteredRecords: IncomeRecord[] = [];
  periodSummaries: PeriodSummary[] = [];

  // Stats
  totalIncome: number = 0;
  totalOrders: number = 0;
  averageOrder: number = 0;
  maxOrder: number = 0;
  minOrder: number = 0;

  // UI
  cartCount: number = 0;

  currentUser: User = {
    name: 'Josue',
    role: 'Dueña',
    initials: 'J'
  };

  sidebarItems: SidebarMenuItem[] = [
    { id: 'menu', label: 'Menú', icon: '🍜', route: '/menu' },
    { id: 'mesas', label: 'Mesas', icon: '🪑', route: '/mesas' },
    { id: 'cocina', label: 'Cocina', icon: '🍳', route: '/cocina' },
    { id: 'clientes', label: 'Clientes', icon: '👥', route: '/clientes' },
    { id: 'entregas', label: 'Entregas', icon: '🚚', route: '/entregas' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { id: 'ingresos', label: 'Ingresos', icon: '💰', route: '/ingresos', active: true },
    { id: 'productos', label: 'Productos', icon: '🍱', route: '/productos' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  ngOnInit() {
    this.setDefaultDates();
    this.loadIncomeData();
  }

  setDefaultDates() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.startDate = firstDayOfMonth.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
  }

  loadIncomeData() {
    // Mock data - En producción vendrá del backend
    this.incomeRecords = this.generateMockData();
    this.applyFilters();
  }

  generateMockData(): IncomeRecord[] {
    const records: IncomeRecord[] = [];
    const today = new Date();

    // Generar datos de los últimos 60 días
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // 3-8 órdenes por día
      const ordersPerDay = Math.floor(Math.random() * 6) + 3;

      for (let j = 0; j < ordersPerDay; j++) {
        const isDelivery = Math.random() > 0.6;
        const subtotal = Math.floor(Math.random() * 800) + 200;
        const tax = subtotal * 0.16;

        records.push({
          id: `ORD-${date.getTime()}-${j}`,
          date: new Date(date),
          orderNumber: `#${String(records.length + 1000).padStart(4, '0')}`,
          type: isDelivery ? 'entrega' : 'mesa',
          items: this.generateRandomItems(),
          subtotal,
          tax,
          total: subtotal + tax,
          paymentMethod: this.getRandomPaymentMethod(),
          customer: isDelivery ? this.getRandomCustomer() : undefined
        });
      }
    }

    return records.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  generateRandomItems(): string[] {
    const items = [
      'Sushi Roll California',
      'Ramen Tonkotsu',
      'Tempura de Camarón',
      'Sashimi Mix',
      'Yakisoba',
      'Gyoza',
      'Edamame',
      'Mochi',
      'Té Verde'
    ];

    const count = Math.floor(Math.random() * 4) + 1;
    const selected: string[] = [];

    for (let i = 0; i < count; i++) {
      const item = items[Math.floor(Math.random() * items.length)];
      if (!selected.includes(item)) {
        selected.push(item);
      }
    }

    return selected;
  }

  getRandomPaymentMethod(): 'efectivo' | 'tarjeta' | 'transferencia' {
    const methods: Array<'efectivo' | 'tarjeta' | 'transferencia'> = ['efectivo', 'tarjeta', 'transferencia'];
    return methods[Math.floor(Math.random() * methods.length)];
  }

  getRandomCustomer(): string {
    const customers = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Luis Rodríguez'];
    return customers[Math.floor(Math.random() * customers.length)];
  }

  applyFilters() {
    let filtered = [...this.incomeRecords];

    // Filtrar por tipo de orden
    if (this.orderType !== 'todos') {
      filtered = filtered.filter(record => record.type === this.orderType);
    }

    // Filtrar por rango de fechas
    if (this.startDate) {
      const start = new Date(this.startDate);
      filtered = filtered.filter(record => record.date >= start);
    }

    if (this.endDate) {
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(record => record.date <= end);
    }

    // Filtrar por búsqueda
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(record =>
        record.orderNumber.toLowerCase().includes(query) ||
        record.customer?.toLowerCase().includes(query) ||
        record.items.some(item => item.toLowerCase().includes(query))
      );
    }

    this.filteredRecords = filtered;
    this.calculateStats();
    this.generatePeriodSummaries();
  }

  calculateStats() {
    if (this.filteredRecords.length === 0) {
      this.totalIncome = 0;
      this.totalOrders = 0;
      this.averageOrder = 0;
      this.maxOrder = 0;
      this.minOrder = 0;
      return;
    }

    this.totalIncome = this.filteredRecords.reduce((sum, record) => sum + record.total, 0);
    this.totalOrders = this.filteredRecords.length;
    this.averageOrder = this.totalIncome / this.totalOrders;
    this.maxOrder = Math.max(...this.filteredRecords.map(r => r.total));
    this.minOrder = Math.min(...this.filteredRecords.map(r => r.total));
  }

  generatePeriodSummaries() {
    const summaryMap = new Map<string, { total: number; orders: number }>();

    this.filteredRecords.forEach(record => {
      const key = this.getPeriodKey(record.date);
      const existing = summaryMap.get(key) || { total: 0, orders: 0 };

      summaryMap.set(key, {
        total: existing.total + record.total,
        orders: existing.orders + 1
      });
    });

    this.periodSummaries = Array.from(summaryMap.entries())
      .map(([period, data]) => ({
        period,
        total: data.total,
        orders: data.orders,
        average: data.total / data.orders,
        percentage: this.totalIncome > 0 ? (data.total / this.totalIncome) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Top 10 períodos
  }

  getPeriodKey(date: Date): string {
    switch (this.periodType) {
      case 'day':
        return date.toLocaleDateString('es-MX', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      case 'month':
        return date.toLocaleDateString('es-MX', {
          month: 'long',
          year: 'numeric'
        });
      case 'year':
        return date.getFullYear().toString();
      default:
        return '';
    }
  }

  onPeriodTypeChange() {
    this.generatePeriodSummaries();
  }

  onOrderTypeChange() {
    this.applyFilters();
  }

  onDateChange() {
    this.applyFilters();
  }

  onSearch() {
    this.applyFilters();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      efectivo: 'Efectivo',
      tarjeta: 'Tarjeta',
      transferencia: 'Transferencia'
    };
    return labels[method] || method;
  }

  exportToCSV() {
    const headers = ['Fecha', 'Orden', 'Tipo', 'Items', 'Subtotal', 'IVA', 'Total', 'Pago', 'Cliente'];
    const rows = this.filteredRecords.map(record => [
      this.formatDate(record.date),
      record.orderNumber,
      record.type === 'mesa' ? 'Mesa' : 'Entrega',
      record.items.join(' | '),
      record.subtotal.toFixed(2),
      record.tax.toFixed(2),
      record.total.toFixed(2),
      this.getPaymentMethodLabel(record.paymentMethod),
      record.customer || '-'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ingresos_${this.startDate}_${this.endDate}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
