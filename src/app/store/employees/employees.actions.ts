import { createAction, props } from '@ngrx/store';
import { Employee } from './employees.models';

// Load Employees
export const loadEmployees = createAction('[Employees Page] Load Employees');

export const loadEmployeesSuccess = createAction(
  '[Employees API] Load Employees Success',
  props<{ employees: Employee[] }>()
);

export const loadEmployeesFailure = createAction(
  '[Employees API] Load Employees Failure',
  props<{ error: string }>()
);

// Create Employee
export const createEmployee = createAction(
  '[Create Employee Dialog] Create Employee',
  props<{ employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'> }>()
);

export const createEmployeeSuccess = createAction(
  '[Employees API] Create Employee Success',
  props<{ employee: Employee; temporaryPassword?: string }>()
);

export const createEmployeeFailure = createAction(
  '[Employees API] Create Employee Failure',
  props<{ error: string }>()
);

// Update Employee
export const updateEmployee = createAction(
  '[Edit Employee Dialog] Update Employee',
  props<{ employeeId: string; employee: Partial<Employee> }>()
);

export const updateEmployeeSuccess = createAction(
  '[Employees API] Update Employee Success',
  props<{ employeeId: string; employee: Partial<Employee> }>()
);

export const updateEmployeeFailure = createAction(
  '[Employees API] Update Employee Failure',
  props<{ error: string }>()
);

// Delete Employee
export const deleteEmployee = createAction(
  '[Employees Table] Delete Employee',
  props<{ employeeId: string }>()
);

export const deleteEmployeeSuccess = createAction(
  '[Employees API] Delete Employee Success',
  props<{ employeeId: string }>()
);

export const deleteEmployeeFailure = createAction(
  '[Employees API] Delete Employee Failure',
  props<{ error: string }>()
);

// Load Positions (for dropdown/assignment)
export const loadPositions = createAction('[Employees Page] Load Positions');

export const loadPositionsSuccess = createAction(
  '[Positions API] Load Positions Success',
  props<{ positions: any[] }>()
);

export const loadPositionsFailure = createAction(
  '[Positions API] Load Positions Failure',
  props<{ error: string }>()
);
