import { createAction, props } from '@ngrx/store';
import { Category } from '../../core/services/supabase.service';

// Load Categories
export const loadCategories = createAction('[Categories Page] Load Categories');

export const loadCategoriesSuccess = createAction(
  '[Categories API] Load Categories Success',
  props<{ categories: Category[] }>()
);

export const loadCategoriesFailure = createAction(
  '[Categories API] Load Categories Failure',
  props<{ error: string }>()
);
