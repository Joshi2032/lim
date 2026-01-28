import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { StatCardComponent, StatVariant } from '../../shared/stat-card/stat-card.component';
import { IncomeFiltersComponent, PeriodType, OrderType } from '../../shared/income-filters/income-filters.component';
import { IncomeTableComponent, IncomeRecord } from '../../shared/income-table/income-table.component';
import { BarChartComponent, BarChartData } from '../../shared/bar-chart/bar-chart.component';

@Component({
  selector: 'app-income-report',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    PageHeaderComponent,
    StatCardComponent,
    IncomeFiltersComponent,
    IncomeTableComponent,
    BarChartComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  periodSummaries: Array<{ period: string; total: number; orders: number; average: number; percentage: number }> = [];
  chartData: BarChartData[] = [];

  // Stats
  totalIncome: number = 0;
  totalOrders: number = 0;
  averageOrder: number = 0;
  maxOrder: number = 0;
  minOrder: number = 0;

  // Stat Cards Data
  statCards: Array<{
    title: string;
    value: string | number;
    subtitle?: string;
    iconSvg: string;
    variant: StatVariant;
  }> = [];

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
    { id: 'recogida', label: 'Recogida', icon: '🛍️', route: '/recogida' },
    { id: 'clientes', label: 'Clientes', icon: '👥', route: '/clientes' },
    { id: 'entregas', label: 'Entregas', icon: '🚚', route: '/entregas' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { id: 'ingresos', label: 'Ingresos', icon: '💰', route: '/ingresos', active: true },
    { id: 'productos', label: 'Productos', icon: '🍱', route: '/productos' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.setDefaultDates();
    this.loadIncomeData();
    this.updateStatCards();
  }

  private updateStatCards() {
    this.statCards = [
      {
        title: 'Ingresos Totales',
        value: this.formatCurrency(this.totalIncome),
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.5 7H11V13L16.2 16.2L17 15.3L12.5 12.4V7Z" fill="currentColor"/></svg>`,
        variant: 'green' as StatVariant
      },
      {
        title: 'Total Órdenes',
        value: this.totalOrders,
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="5" width="16" height="14" rx="2.5" ry="2.5" stroke="currentColor" stroke-width="2"/><path d="M7 9H17M7 13H13M17 13L15 11M17 13L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        variant: 'blue' as StatVariant
      },
      {
        title: 'Promedio por Orden',
        value: this.formatCurrency(this.averageOrder),
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 13C3 11 5 10 9 10C13 10 15 11 15 13M9 10C6.24 10 4 11.5 4 13.5C4 15.5 6.24 17 9 17C11.76 17 14 15.5 14 13.5M15 13C15 11 17 10 21 10C25 10 27 11 27 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        variant: 'amber' as StatVariant
      },
      {
        title: 'Orden Máxima',
        value: this.formatCurrency(this.maxOrder),
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 8L12 3L17 8V19C17 19.5304 16.7893 20.0391 16.4142 20.4142C16.0391 20.7893 15.5304 21 15 21H9C8.46957 21 7.96086 20.7893 7.58579 20.4142C7.21071 20.0391 7 19.5304 7 19V8Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
        variant: 'red' as StatVariant
      },
      {
        title: 'Orden Mínima',
        value: this.formatCurrency(this.minOrder),
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 16L12 21L17 16V5C17 4.46957 16.7893 3.96086 16.4142 3.58579C16.0391 3.21071 15.5304 3 15 3H9C8.46957 3 7.96086 3.21071 7.58579 3.58579C7.21071 3.96086 7 4.46957 7 5V16Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
        variant: 'purple' as StatVariant
      }
    ];
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
    const ITEMS = [
      'Sushi Roll California', 'Ramen Tonkotsu', 'Tempura de Camarón', 'Sashimi Mix', 'Yakisoba',
      'Gyoza', 'Edamame', 'Mochi', 'Té Verde', 'Bebida de Fruta', 'Ensalada Japonesa', 'Arroz Frito'
    ];

    const count = Math.floor(Math.random() * 4) + 1;
    const selected: string[] = [];

    for (let i = 0; i < count; i++) {
      const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
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
    const CUSTOMERS = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Luis Rodríguez'];
    return CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
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
    this.cdr.markForCheck();
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

    // Actualizar datos del gráfico
    this.chartData = this.periodSummaries.map(summary => ({
      label: summary.period,
      value: summary.total,
      percentage: summary.percentage,
      subtitle: `${summary.orders} órdenes`,
      color: '#22c55e'
    }));
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
    this.updateStatCards();
    this.cdr.markForCheck();
  }

  onOrderTypeChange() {
    this.applyFilters();
    this.updateStatCards();
    this.cdr.markForCheck();
  }

  onDateChange() {
    this.applyFilters();
    this.updateStatCards();
    this.cdr.markForCheck();
  }

  onSearch() {
    this.applyFilters();
    this.updateStatCards();
    this.cdr.markForCheck();
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
