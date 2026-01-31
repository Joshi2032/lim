import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Employee } from './employees.models';
import * as EmployeesActions from './employees.actions';

export interface Position {
  id: string;
  name: string;
}

export interface EmployeesState extends EntityState<Employee> {
  loading: boolean;
  error: string | null;
  positions: Position[];
  positionsLoading: boolean;
}

export const employeesAdapter: EntityAdapter<Employee> = createEntityAdapter<Employee>({
  selectId: (employee: Employee) => employee.id,
  sortComparer: (a: Employee, b: Employee) => a.full_name.localeCompare(b.full_name)
});

export const initialState: EmployeesState = employeesAdapter.getInitialState({
  loading: false,
  error: null,
  positions: [],
  positionsLoading: false
});

export const employeesReducer = createReducer(
  initialState,
  on(EmployeesActions.loadEmployees, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(EmployeesActions.loadEmployeesSuccess, (state, { employees }) =>
    employeesAdapter.setAll(employees, {
      ...state,
      loading: false
    })
  ),
  on(EmployeesActions.loadEmployeesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(EmployeesActions.createEmployeeSuccess, (state, { employee }) =>
    employeesAdapter.addOne(employee, state)
  ),
  on(EmployeesActions.updateEmployeeSuccess, (state, { employeeId, employee }) =>
    employeesAdapter.updateOne(
      { id: employeeId, changes: employee },
      state
    )
  ),
  on(EmployeesActions.deleteEmployeeSuccess, (state, { employeeId }) =>
    employeesAdapter.removeOne(employeeId, state)
  ),
  on(EmployeesActions.loadPositions, (state) => ({
    ...state,
    positionsLoading: true
  })),
  on(EmployeesActions.loadPositionsSuccess, (state, { positions }) => ({
    ...state,
    positions,
    positionsLoading: false
  })),
  on(EmployeesActions.loadPositionsFailure, (state) => ({
    ...state,
    positionsLoading: false
  }))
);

export const {
  selectIds: selectEmployeeIds,
  selectEntities: selectEmployeeEntities,
  selectAll: selectAllEmployees,
  selectTotal: selectTotalEmployees
} = employeesAdapter.getSelectors();

export const selectEmployeesLoading = (state: EmployeesState) => state.loading;
export const selectEmployeesError = (state: EmployeesState) => state.error;
export const selectPositions = (state: EmployeesState) => state.positions;
export const selectPositionsLoading = (state: EmployeesState) => state.positionsLoading;
