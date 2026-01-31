import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AssignmentsState, selectAllAssignments, selectAssignmentsError, selectAssignmentsLoading } from './assignments.reducer';

export const selectAssignmentsState = createFeatureSelector<AssignmentsState>('assignments');

// Base selectors
export const selectAssignments = createSelector(
  selectAssignmentsState,
  selectAllAssignments
);

export const selectAssignmentsLoadingState = createSelector(
  selectAssignmentsState,
  selectAssignmentsLoading
);

export const selectAssignmentsErrorState = createSelector(
  selectAssignmentsState,
  selectAssignmentsError
);

// Computed selectors
export const selectAssignmentsByStatus = (status: string) =>
  createSelector(
    selectAssignments,
    assignments => assignments.filter(a => a.status === status)
  );

export const selectAssignmentsByDeliveryPerson = (deliveryPersonId: string) =>
  createSelector(
    selectAssignments,
    assignments => assignments.filter(a => a.delivery_person_id === deliveryPersonId)
  );
