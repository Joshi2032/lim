import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import * as AssignmentsActions from './assignments.actions';
import { Assignment } from './assignments.models';

export interface AssignmentsState extends EntityState<Assignment> {
  loading: boolean;
  error: string | null;
}

export const assignmentsAdapter: EntityAdapter<Assignment> = createEntityAdapter<Assignment>({
  selectId: (assignment: Assignment) => assignment.id,
  sortComparer: (a: Assignment, b: Assignment) => b.assigned_at.localeCompare(a.assigned_at)
});

export const initialState: AssignmentsState = assignmentsAdapter.getInitialState({
  loading: false,
  error: null
});

export const assignmentsReducer = createReducer(
  initialState,
  on(AssignmentsActions.loadAssignments, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AssignmentsActions.loadAssignmentsSuccess, (state, { assignments }) =>
    assignmentsAdapter.setAll(assignments, {
      ...state,
      loading: false
    })
  ),
  on(AssignmentsActions.loadAssignmentsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(AssignmentsActions.createAssignmentSuccess, (state, { assignment }) =>
    assignmentsAdapter.addOne(assignment, state)
  ),
  on(AssignmentsActions.updateAssignmentSuccess, (state, { assignmentId, assignment }) =>
    assignmentsAdapter.updateOne(
      { id: assignmentId, changes: assignment },
      state
    )
  ),
  on(AssignmentsActions.deleteAssignmentSuccess, (state, { assignmentId }) =>
    assignmentsAdapter.removeOne(assignmentId, state)
  ),
  on(AssignmentsActions.assignmentsUpdated, (state, { assignments }) =>
    assignmentsAdapter.setAll(assignments, state)
  )
);

export const {
  selectAll: selectAllAssignments,
  selectEntities: selectAssignmentEntities,
  selectIds: selectAssignmentIds,
  selectTotal: selectAssignmentsTotal
} = assignmentsAdapter.getSelectors();

export const selectAssignmentsLoading = (state: AssignmentsState) => state.loading;
export const selectAssignmentsError = (state: AssignmentsState) => state.error;
