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
    // Mock data removed - all data should come from real operations
    // Keep this method for backwards compatibility but it does nothing
    return;
  }

  private minutesAgo(min: number): Date {
    return new Date(Date.now() - min * 60 * 1000);
  }
}
