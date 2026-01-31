import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, tap } from 'rxjs/operators';
import { SupabaseService } from '../../core/services/supabase.service';
import * as AssignmentsActions from './assignments.actions';

@Injectable()
export class AssignmentsEffects {
  loadAssignments$;
  createAssignment$;
  updateAssignment$;
  deleteAssignment$;
  subscribeToAssignments$;

  constructor(
    private actions$: Actions,
    private supabase: SupabaseService,
    private store: Store
  ) {
    this.loadAssignments$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AssignmentsActions.loadAssignments),
        switchMap(() =>
          this.supabase.getAssignments().then(
            assignments => AssignmentsActions.loadAssignmentsSuccess({ assignments }),
            (error: any) => AssignmentsActions.loadAssignmentsFailure({ error: error.message })
          )
        )
      )
    );

    this.createAssignment$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AssignmentsActions.createAssignment),
        switchMap(({ assignment }) =>
          this.supabase.createAssignment(assignment).then(
            (result: any) => AssignmentsActions.createAssignmentSuccess({ assignment: result }),
            (error: any) => AssignmentsActions.createAssignmentFailure({ error: error.message })
          )
        )
      )
    );

    this.updateAssignment$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AssignmentsActions.updateAssignment),
        switchMap(({ assignmentId, assignment }) =>
          this.supabase.updateAssignment(assignmentId, assignment).then(
            () => AssignmentsActions.updateAssignmentSuccess({ assignmentId, assignment }),
            (error: any) => AssignmentsActions.updateAssignmentFailure({ error: error.message })
          )
        )
      )
    );

    this.deleteAssignment$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AssignmentsActions.deleteAssignment),
        switchMap(({ assignmentId }) =>
          this.supabase.deleteAssignment(assignmentId).then(
            () => AssignmentsActions.deleteAssignmentSuccess({ assignmentId }),
            (error: any) => AssignmentsActions.deleteAssignmentFailure({ error: error.message })
          )
        )
      )
    );

    this.subscribeToAssignments$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AssignmentsActions.subscribeToAssignments),
        tap(() => {
          this.supabase.subscribeToAssignments((assignments) => {
            this.store.dispatch(AssignmentsActions.assignmentsUpdated({ assignments }));
          });
        })
      ),
      { dispatch: false }
    );
  }
}
