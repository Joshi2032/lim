import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ActivitySection = 'menu' | 'mesas' | 'cocina' | 'clientes' | 'entregas' | 'usuarios' | 'panel';
export type ActivityStatus = 'info' | 'success' | 'warning';

export interface ActivityLog {
  id: string;
  title: string;
  description: string;
  section: ActivitySection;
  status: ActivityStatus;
  actor: string;
  role: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class MovementsService {
  private readonly logs$ = new BehaviorSubject<ActivityLog[]>([]);
  private seeded = false;

  getLogs(): Observable<ActivityLog[]> {
    return this.logs$.asObservable();
  }

  log(entry: Omit<ActivityLog, 'id' | 'timestamp'> & { timestamp?: Date }) {
    const log: ActivityLog = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      timestamp: entry.timestamp ?? new Date(),
      ...entry
    };

    const updated = [log, ...this.logs$.value].slice(0, 200);
    this.logs$.next(updated);
  }

  seedDemoData() {
    if (this.seeded) return;
    this.seeded = true;

    const demo: Array<Omit<ActivityLog, 'id'>> = [
      {
        title: 'Orden movida a Cocina',
        description: 'Mesa 12 enviada a cocina con 2 items',
        section: 'cocina',
        status: 'info',
        actor: 'Josue',
        role: 'Dueña',
        timestamp: this.minutesAgo(18)
      },
      {
        title: 'Combo agregado al menú',
        description: 'Nuevo Combo Sashimi (4 piezas) con variantes',
        section: 'menu',
        status: 'success',
        actor: 'Josue',
        role: 'Dueña',
        timestamp: this.minutesAgo(50)
      },
      {
        title: 'Usuario actualizado',
        description: 'Se editó el rol de Ana Ruiz a Encargado',
        section: 'usuarios',
        status: 'success',
        actor: 'Josue',
        role: 'Dueña',
        timestamp: this.minutesAgo(90)
      },
      {
        title: 'Entrega marcada como lista',
        description: 'Pedido #458 para mesa 7 listo para entregar',
        section: 'entregas',
        status: 'info',
        actor: 'Josue',
        role: 'Dueña',
        timestamp: this.minutesAgo(130)
      },
      {
        title: 'Inventario advertencia',
        description: 'Salmón ahumado bajo (restan 4 porciones)',
        section: 'cocina',
        status: 'warning',
        actor: 'Sistema',
        role: 'Automático',
        timestamp: this.minutesAgo(160)
      }
    ];

    demo.forEach(d => this.log(d));
  }

  private minutesAgo(min: number): Date {
    return new Date(Date.now() - min * 60 * 1000);
  }
}
