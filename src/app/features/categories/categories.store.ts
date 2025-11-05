import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';

import {
  Category,
  CategoryTree,
  CategoryFilters,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryStats,
  MoveCategoryDto
} from '@core/models';
import { CategoryService } from './data/category.service';

interface CategoriesState {
  categories: Category[];
  selectedCategory: Category | null;
  loading: boolean;
  error: string | null;
  filters: CategoryFilters;
}

const initialState: CategoriesState = {
  categories: [],
  selectedCategory: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    parentId: null,
    showEmpty: true,
  },
};

export const CategoriesStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => ({
    categoryTree: computed((): CategoryTree[] => {
      const categories = store.categories();

      const buildTree = (parentId: string | null, level: number = 0): CategoryTree[] => {
        return categories
          .filter(cat => cat.parentId === parentId)
          .sort((a, b) => a.order - b.order)
          .map(cat => ({
            ...cat,
            level,
            children: buildTree(cat.id, level + 1),
          }));
      };

      return buildTree(null, 0);
    }),

    sortedCategories: computed(() => {
      const categories = store.categories();
      return [...categories].sort((a, b) => {
        if (a.parentId === b.parentId) {
          return a.order - b.order;
        }
        return a.name.localeCompare(b.name);
      });
    }),

    rootCategories: computed(() =>
      store.categories().filter((c) => c.parentId === null)
    ),

    getCategoryById: computed(() => {
      const categories = store.categories();
      return (id: string) => categories.find(c => c.id === id);
    }),

    getChildren: computed(() => {
      const categories = store.categories();
      return (parentId: string) => categories.filter(c => c.parentId === parentId);
    }),

    getDescendants: computed(() => {
      const categories = store.categories();

      return (parentId: string): Category[] => {
        const descendants: Category[] = [];
        const queue = [parentId];

        while (queue.length > 0) {
          const currentId = queue.shift()!;
          const children = categories.filter(c => c.parentId === currentId);
          descendants.push(...children);
          queue.push(...children.map(c => c.id));
        }

        return descendants;
      };
    }),

    getBreadcrumbs: computed(() => {
      const categories = store.categories();

      return (categoryId: string): Category[] => {
        const breadcrumbs: Category[] = [];
        let current = categories.find(c => c.id === categoryId);

        while (current) {
          breadcrumbs.unshift(current);
          current = current.parentId
            ? categories.find(c => c.id === current!.parentId!)
            : undefined;
        }

        return breadcrumbs;
      };
    }),

    stats: computed((): CategoryStats => {
      const categories = store.categories();

      const buildTree = (parentId: string | null): CategoryTree[] => {
        return categories
          .filter(cat => cat.parentId === parentId)
          .map(cat => ({
            ...cat,
            level: 0,
            children: buildTree(cat.id),
          }));
      };

      const getMaxDepth = (nodes: CategoryTree[], depth: number = 0): number => {
        if (nodes.length === 0) return depth;
        return Math.max(...nodes.map(n => getMaxDepth(n.children, depth + 1)));
      };

      const tree = buildTree(null);

      return {
        total: categories.length,
        rootCategories: categories.filter(c => c.parentId === null).length,
        maxDepth: getMaxDepth(tree),
        totalResources: categories.reduce((sum, c) =>
          sum + (c.metadata.resourceCount || 0), 0
        ),
        totalNotes: categories.reduce((sum, c) =>
          sum + (c.metadata.noteCount || 0), 0
        ),
      };
    }),

    hasActiveFilters: computed(() => {
      const filters = store.filters();
      return (
        filters.search !== '' ||
        filters.parentId !== null ||
        filters.showEmpty === false
      );
    }),
  })),

  withMethods((store, categoryService = inject(CategoryService)) => ({
    loadCategories: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          categoryService.getAll().pipe(
            tap((categories: Category[]) => {
              patchState(store, {
                categories,
                loading: false
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: error.message,
                loading: false
              });
              console.error('Failed to load categories:', error);
              return of([]);
            })
          )
        )
      )
    ),

    selectCategory(id: string) {
      const category = store.categories().find((c) => c.id === id) || null;
      patchState(store, { selectedCategory: category });
    },

    clearSelection() {
      patchState(store, { selectedCategory: null });
    },

    addCategory: rxMethod<CreateCategoryDto>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((dto) =>
          categoryService.create(dto).pipe(
            tap((newCategory: Category) => {
              patchState(store, {
                categories: [...store.categories(), newCategory],
                loading: false,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: error.message,
                loading: false
              });
              console.error('Failed to add category:', error);
              return of(null);
            })
          )
        )
      )
    ),

    updateCategory: rxMethod<{ id: string; updates: UpdateCategoryDto }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, updates }) =>
          categoryService.update(id, updates).pipe(
            tap((updatedCategory: Category) => {
              patchState(store, {
                categories: store.categories().map((c) =>
                  c.id === id ? updatedCategory : c
                ),
                loading: false,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: error.message,
                loading: false
              });
              console.error('Failed to update category:', error);
              return of(null);
            })
          )
        )
      )
    ),

    deleteCategory: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          categoryService.deleteCategory(id).pipe(
            tap(() => {
              patchState(store, {
                categories: store.categories().filter((c) => c.id !== id),
                selectedCategory:
                  store.selectedCategory()?.id === id
                    ? null
                    : store.selectedCategory(),
                loading: false,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: error.message,
                loading: false
              });
              console.error('Failed to delete category:', error);
              return of(null);
            })
          )
        )
      )
    ),

    moveCategory: rxMethod<MoveCategoryDto>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((dto) =>
          categoryService.moveCategory(dto).pipe(
            tap((updatedCategory: Category) => {
              patchState(store, {
                categories: store.categories().map((c) =>
                  c.id === dto.categoryId ? updatedCategory : c
                ),
                loading: false,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: error.message,
                loading: false
              });
              console.error('Failed to move category:', error);
              return of(null);
            })
          )
        )
      )
    ),

    updateFilters(filters: Partial<CategoryFilters>) {
      patchState(store, {
        filters: { ...store.filters(), ...filters },
      });
    },

    resetFilters() {
      patchState(store, { filters: initialState.filters });
    },

    clearError() {
      patchState(store, { error: null });
    },
  }))
);
