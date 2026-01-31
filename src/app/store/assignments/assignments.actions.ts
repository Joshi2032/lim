import { createAction, props } from '@ngrx/store';
import { Assignment, AssignmentCreate, AssignmentUpdate } from './assignments.models';

// Load Assignments
export const loadAssignments = createAction('[Assignments Page] Load Assignments');

export const loadAssignmentsSuccess = createAction(
  '[Assignments API] Load Assignments Success',
  props<{ assignments: Assignment[] }>()
);

export const loadAssignmentsFailure = createAction(
  '[Assignments API] Load Assignments Failure',
  props<{ error: string }>()
);

// Create Assignment
export const createAssignment = createAction(
  '[Assignments Page] Create Assignment',
  props<{ assignment: AssignmentCreate }>()
);

export const createAssignmentSuccess = createAction(
  '[Assignments API] Create Assignment Success',
  props<{ assignment: Assignment }>()
);

export const createAssignmentFailure = createAction(
  '[Assignments API] Create Assignment Failure',
  props<{ error: string }>()
);

// Update Assignment
export const updateAssignment = createAction(
  '[Assignments Page] Update Assignment',
  props<{ assignmentId: string; assignment: AssignmentUpdate }>()
);

export const updateAssignmentSuccess = createAction(
  '[Assignments API] Update Assignment Success',
  props<{ assignmentId: string; assignment: AssignmentUpdate }>()
);

export const updateAssignmentFailure = createAction(
  '[Assignments API] Update Assignment Failure',
  props<{ error: string }>()
);

// Delete Assignment
export const deleteAssignment = createAction(
  '[Assignments Page] Delete Assignment',
  props<{ assignmentId: string }>()
);

export const deleteAssignmentSuccess = createAction(
  '[Assignments API] Delete Assignment Success',
  props<{ assignmentId: string }>()
);

export const deleteAssignmentFailure = createAction(
  '[Assignments API] Delete Assignment Failure',
  props<{ error: string }>()
);

// Subscribe to Assignments (real-time)
export const subscribeToAssignments = createAction('[Assignments Page] Subscribe To Assignments');

export const assignmentsUpdated = createAction(
  '[Assignments Subscription] Assignments Updated',
  props<{ assignments: Assignment[] }>()
);
