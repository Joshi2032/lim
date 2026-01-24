import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ActivityLog {
  id: string;
  title: string;
  description: string;
  section: 'menu' | 'mesas' | 'cocina' | 'clientes' | 'entregas' | 'usuarios' | 'panel';
  status: 'info' | 'success' | 'warning';
  actor: string;
  role: string;
  time: string;
}

@Component({
  selector: 'app-movements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movements.component.html',
  styleUrl: './movements.component.scss'
})
export class MovementsComponent {
  activeSection: ActivityLog['section'] | 'all' = 'all';
  activityLog: ActivityLog[] = [];

  constructor() {
    this.loadActivityLog();
  }

  loadActivityLog() {
    this.activityLog = [
      {
        id: '1',
        title: 'Orden movida a Cocina',
        description: 'Mesa 12 enviada a cocina con 2 items',
        section: 'cocina',
        status: 'info',
        actor: 'Josue',
        role: 'Dueña',
        time: 'hoy · 11:42'
      },
      {
        id: '2',
        title: 'Combo agregado al menú',
        description: 'Nuevo Combo Sashimi (4 piezas) con variantes',
        section: 'menu',
        status: 'success',
        actor: 'Josue',
        role: 'Dueña',
        time: 'hoy · 11:05'
      },
      {
        id: '3',
        title: 'Usuario actualizado',
        description: 'Se editó el rol de Ana Ruiz a Encargado',
        section: 'usuarios',
        status: 'success',
        actor: 'Josue',
        role: 'Dueña',
        time: 'ayer · 18:22'
      },
      {
        id: '4',
        title: 'Entrega marcada como lista',
        description: 'Pedido #458 para mesa 7 listo para entregar',
        section: 'entregas',
        status: 'info',
        actor: 'Josue',
        role: 'Dueña',
        time: 'ayer · 17:10'
      },
      {
        id: '5',
        title: 'Inventario advertencia',
        description: 'Salmón ahumado bajo (restan 4 porciones)',
        section: 'cocina',
        status: 'warning',
        actor: 'Sistema',
        role: 'Automático',
        time: 'ayer · 16:55'
      }
    ];
  }

  setSectionFilter(section: ActivityLog['section'] | 'all') {
    this.activeSection = section;
  }

  get filteredActivityLog() {
    if (this.activeSection === 'all') return this.activityLog;
    return this.activityLog.filter(a => a.section === this.activeSection);
  }
}
