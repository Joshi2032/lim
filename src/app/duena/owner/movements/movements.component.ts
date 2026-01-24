import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ActivityLog, ActivitySection, ActivityStatus, MovementsService } from '../../../shared/movements/movements.service';

@Component({
  selector: 'app-movements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movements.component.html',
  styleUrl: './movements.component.scss'
})
export class MovementsComponent implements OnInit, OnDestroy {
  activeSection: ActivitySection | 'all' = 'all';
  activeStatus: ActivityStatus | 'all' = 'all';
  searchQuery: string = '';
  activityLog: ActivityLog[] = [];
  private sub?: Subscription;

  constructor(private movements: MovementsService) {}

  ngOnInit() {
    this.movements.seedDemoData();
    this.sub = this.movements.getLogs().subscribe(logs => this.activityLog = logs);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  setSectionFilter(section: ActivitySection | 'all') {
    this.activeSection = section;
  }

  setStatusFilter(status: ActivityStatus | 'all') {
    this.activeStatus = status;
  }

  onSearch(query: string) {
    this.searchQuery = query.toLowerCase();
  }

  get filteredActivityLog() {
    return this.activityLog
      .filter(a => this.activeSection === 'all' || a.section === this.activeSection)
      .filter(a => this.activeStatus === 'all' || a.status === this.activeStatus)
      .filter(a => {
        if (!this.searchQuery.trim()) return true;
        const q = this.searchQuery;
        return (
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.actor.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q)
        );
      });
  }
}
