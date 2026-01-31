import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { SupabaseService } from '../../core/services/supabase.service';
import * as EmployeesActions from './employees.actions';

@Injectable()
export class EmployeesEffects {
  loadEmployees$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeesActions.loadEmployees),
      switchMap(() =>
        this.supabase.getEmployees().then(
          employees => EmployeesActions.loadEmployeesSuccess({ employees }),
          error => EmployeesActions.loadEmployeesFailure({ error: error.message })
        )
      )
    )
  );

  loadPositions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeesActions.loadPositions),
      switchMap(() =>
        this.supabase.getPositions().then(
          positions => EmployeesActions.loadPositionsSuccess({ positions }),
          error => EmployeesActions.loadPositionsFailure({ error: error.message })
        )
      )
    )
  );

  createEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeesActions.createEmployee),
      switchMap(({ employee }) =>
        this.supabase.createEmployee(employee).then(
          result => EmployeesActions.createEmployeeSuccess({ employee: result }),
          error => EmployeesActions.createEmployeeFailure({ error: error.message })
        )
      )
    )
  );

  updateEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeesActions.updateEmployee),
      switchMap(({ employeeId, employee }) =>
        this.supabase.updateEmployee(employeeId, employee).then(
          () => EmployeesActions.updateEmployeeSuccess({ employeeId, employee }),
          error => EmployeesActions.updateEmployeeFailure({ error: error.message })
        )
      )
    )
  );

  deleteEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeesActions.deleteEmployee),
      switchMap(({ employeeId }) =>
        this.supabase.deleteEmployee(employeeId).then(
          () => EmployeesActions.deleteEmployeeSuccess({ employeeId }),
          error => EmployeesActions.deleteEmployeeFailure({ error: error.message })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private supabase: SupabaseService
  ) {}
}
