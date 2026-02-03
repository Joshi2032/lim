import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap } from 'rxjs/operators';
import { SupabaseService } from '../../core/services/supabase.service';
import { Employee } from './employees.models';
import * as EmployeesActions from './employees.actions';

@Injectable()
export class EmployeesEffects {
  loadEmployees$;
  loadPositions$;
  createEmployee$;
  updateEmployee$;
  deleteEmployee$;

  constructor(
    private actions$: Actions,
    private supabase: SupabaseService
  ) {
    this.loadEmployees$ = createEffect(() =>
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

    this.loadPositions$ = createEffect(() =>
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

    this.createEmployee$ = createEffect(() =>
      this.actions$.pipe(
        ofType(EmployeesActions.createEmployee),
        switchMap(({ employee, password }) =>
          this.supabase.createEmployee(employee, password).then(
            result => {
              const temporaryPassword = (result as any).temporaryPassword;
              return EmployeesActions.createEmployeeSuccess({
                employee: result,
                temporaryPassword
              });
            },
            error => EmployeesActions.createEmployeeFailure({ error: error.message })
          )
        )
      )
    );

    this.updateEmployee$ = createEffect(() =>
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

    this.deleteEmployee$ = createEffect(() =>
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
  }
}
