import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EmployeesState, selectAllEmployees, selectEmployeesError, selectEmployeesLoading, selectPositions, selectPositionsLoading } from './employees.reducer';

export const selectEmployeesState = createFeatureSelector<EmployeesState>('employees');

// Base selectors
export const selectEmployees = createSelector(
  selectEmployeesState,
  selectAllEmployees
);

export const selectEmployeesLoadingState = createSelector(
  selectEmployeesState,
  selectEmployeesLoading
);

export const selectEmployeesErrorState = createSelector(
  selectEmployeesState,
  selectEmployeesError
);

export const selectEmployeesPositions = createSelector(
  selectEmployeesState,
  selectPositions
);

export const selectPositionsLoadingState = createSelector(
  selectEmployeesState,
  selectPositionsLoading
);

// Computed selectors
export const selectEmployeeCount = createSelector(
  selectEmployees,
  employees => employees.length
);

export const selectDeliveryPersons = createSelector(
  selectEmployees,
  employees => employees.filter(e => e.position?.name === 'delivery')
);

export const selectChefs = createSelector(
  selectEmployees,
  employees => employees.filter(e => e.position?.name === 'chef')
);

export const selectWaiters = createSelector(
  selectEmployees,
  employees => employees.filter(e => e.position?.name === 'waiter')
);

export const selectEmployeesByPosition = (positionName: string) =>
  createSelector(
    selectEmployees,
    employees => employees.filter(e => e.position?.name === positionName)
  );

export const selectEmployeeById = (id: string) =>
  createSelector(
    selectEmployees,
    employees => employees.find(e => e.id === id)
  );

export const selectEmployeesStats = createSelector(
  selectEmployees,
  selectEmployeesPositions,
  (employees, positions) => {
    const statsByPosition: Record<string, number> = {};
    positions.forEach(pos => {
      statsByPosition[pos.name] = employees.filter(e => e.position?.name === pos.name).length;
    });

    return {
      total: employees.length,
      byPosition: statsByPosition,
      available: employees.filter(e => e.active).length
    };
  }
);
