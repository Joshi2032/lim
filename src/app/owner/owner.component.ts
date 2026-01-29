import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { ProductsManagementComponent } from './products-management/products-management.component';
import { SidebarComponent, MenuItem } from '../shared/sidebar/sidebar.component';
import { IncomeReportComponent } from './income-report/income-report.component';
import { SupabaseService } from '../core/services/supabase.service';

export interface StatCardData {
  title: string;
  value: string | number;
  subtitle: string;
  iconSvg?: string;
  trendLabel?: string;
  trendDirection?: 'up' | 'down';
  variant?: string;
}

export interface TopProduct {
  id: string;
  name: string;
  quantity: number;
  rank: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  total: number;
  timestamp: Date;
}

@Component({
  selector: 'app-owner',
  standalone: true,
  imports: [CommonModule, SidebarComponent, DashboardComponent, ProductsManagementComponent, IncomeReportComponent, PageHeaderComponent],
  templateUrl: './owner.component.html',
  styleUrl: './owner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnerComponent implements OnInit {
  activeSection: 'dashboard' | 'productos' | 'ingresos' = 'dashboard';
  
  currentUser = {
    name: 'Josue',
    role: 'Dueña',
    initials: 'J'
  };

  stats: StatCardData[] = [];
  topProducts: TopProduct[] = [];
  recentOrders: RecentOrder[] = [];
  tooltipX = 0;
  tooltipY = 0;
  tooltipVisible = false;
  tooltipText = '';

  readonly sidebarItems: MenuItem[] = [
    { id: 'menu', label: 'Menú', icon: '', route: '/menu' },
    { id: 'mesas', label: 'Mesas', icon: '', route: '/mesas' },
    { id: 'cocina', label: 'Cocina', icon: '', route: '/cocina' },
    { id: 'recogida', label: 'Recogida', icon: '', route: '/recogida' },
    { id: 'entregas', label: 'Entregas', icon: '', route: '/entregas' },
    { id: 'clientes', label: 'Clientes', icon: '', route: '/clientes' },
    { id: 'dashboard', label: 'Dashboard', icon: '', route: '/dashboard' },
    { id: 'panel', label: 'Panel de Control', icon: '', route: '/panel-control' },
    { id: 'usuarios', label: 'Usuarios', icon: '', route: '/usuarios' }
  ];

  constructor(
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // All data comes from Supabase now - empty arrays
    this.stats = [
      {
        title: 'Órdenes hoy',
        value: 0,
        subtitle: '',
        iconSvg: \<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M3 10H21\" stroke=\"currentColor\" stroke-width=\"2\"/></svg>\,
        trendLabel: '',
        trendDirection: '',
        variant: 'purple'
      },
      {
        title: 'Entregas en curso',
        value: 0,
        subtitle: '',
        iconSvg: \<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M9 17C9 18.1046 8.10457 19 7 19C5.89543 19 5 18.1046 5 17C5 15.8954 5.89543 15 7 15C8.10457 15 9 15.8954 9 17Z\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M19 17C19 18.1046 18.1046 19 17 19C15.8954 19 15 18.1046 15 17C15 15.8954 15.8954 15 17 15C18.1046 15 19 15.8954 19 17Z\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M5 17H1V6C1 5.44772 1.44772 5 2 5H14V17M9 17H15M19 17H23V12.5L20 8H14V17\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>\,
        trendLabel: '',
        trendDirection: '',
        variant: 'purple'
      },
      {
        title: 'Total cobrado',
        value: '\',
        subtitle: '',
        iconSvg: \<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12 3V21M7 7H16C17.1046 7 18 7.89543 18 9C18 10.1046 17.1046 11 16 11H9C7.89543 11 7 11.8954 7 13C7 14.1046 7.89543 15 9 15H17\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>\,
        trendLabel: '',
        trendDirection: '',
        variant: 'amber'
      }
    ];

    this.topProducts = [];
    this.recentOrders = [];
  }

  onChartHover(event: MouseEvent, day: string, value: number) {
    const svg = event.currentTarget as SVGElement;
    const containerRect = svg.parentElement?.getBoundingClientRect();

    const x = event.clientX - (containerRect?.left || 0);
    const y = event.clientY - (containerRect?.top || 0);

    const minX = 50;
    const maxX = 530;
    const constrainedX = Math.max(minX, Math.min(maxX, x));

    this.tooltipX = constrainedX;
    this.tooltipY = y - 50;
    this.tooltipText = \\\\: \\\\;
    this.tooltipVisible = true;
    this.cdr.markForCheck();
  }

  onChartLeave() {
    this.tooltipVisible = false;
    this.cdr.markForCheck();
  }

  selectSection(section: 'dashboard' | 'productos' | 'ingresos') {
    this.activeSection = section;
    this.cdr.markForCheck();
  }
}
