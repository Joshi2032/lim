import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Category } from './categories.models';
import * as CategoriesActions from './categories.actions';

export interface CategoriesState extends EntityState<Category> {
  loading: boolean;
  error: string | null;
}

export const categoriesAdapter: EntityAdapter<Category> = createEntityAdapter<Category>({
  selectId: (category: Category) => category.id,
  sortComparer: (a: Category, b: Category) => a.name.localeCompare(b.name)
});

export const initialState: CategoriesState = categoriesAdapter.getInitialState({
  loading: false,
  error: null
});

export const categoriesReducer = createReducer(
  initialState,
  on(CategoriesActions.loadCategories, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CategoriesActions.loadCategoriesSuccess, (state, { categories }) =>
    categoriesAdapter.setAll(categories, {
      ...state,
      loading: false
    })
  ),
  on(CategoriesActions.loadCategoriesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);

export const {
  selectAll: selectAllCategories,
  selectEntities: selectCategoryEntities,
  selectIds: selectCategoryIds,
  selectTotal: selectCategoriesTotal
} = categoriesAdapter.getSelectors();

export const selectCategoriesLoading = (state: CategoriesState) => state.loading;
export const selectCategoriesError = (state: CategoriesState) => state.error;
