import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';

import { Tag, TagFilters, CreateTagDto, UpdateTagDto, TagStats } from '@core/models';
import { TagService } from './data/tag.service';

interface TagsState {
  tags: Tag[];
  selectedTag: Tag | null;
  loading: boolean;
  error: string | null;
  filters: TagFilters;
}

const initialState: TagsState = {
  tags: [],
  selectedTag: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
  },
};

export const TagsStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => ({
    filteredTags: computed(() => {
      const tags = store.tags();
      const filters = store.filters();

      let filtered = tags;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter((tag) =>
          tag.name.toLowerCase().includes(searchLower)
        );
      }

      filtered = [...filtered].sort((a, b) => {
        const sortBy = filters.sortBy || 'name';
        const sortOrder = filters.sortOrder || 'asc';
        
        let comparison = 0;
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'usageCount') {
          comparison = a.usageCount - b.usageCount;
        } else if (sortBy === 'createdAt') {
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });

      return filtered;
    }),

    stats: computed((): TagStats => {
      const tags = store.tags();
      const totalUsage = tags.reduce((sum, tag) => sum + tag.usageCount, 0);
      const mostUsed = tags.length > 0
        ? tags.reduce((max, tag) => tag.usageCount > max.usageCount ? tag : max, tags[0])
        : null;

      return {
        total: tags.length,
        totalUsage,
        mostUsed,
      };
    }),

    hasActiveFilters: computed(() => {
      const filters = store.filters();
      return filters.search !== '';
    }),
  })),

  withMethods((store, tagService = inject(TagService)) => ({
    loadTags: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          tagService.getAll().pipe(
            tap((tags: Tag[]) => {
              patchState(store, {
                tags,
                loading: false
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: error.message,
                loading: false
              });
              console.error('Failed to load tags:', error);
              return of([]);
            })
          )
        )
      )
    ),

    selectTag(id: string) {
      const tag = store.tags().find((t) => t.id === id) || null;
      patchState(store, { selectedTag: tag });
    },

    clearSelection() {
      patchState(store, { selectedTag: null });
    },

    addTag: rxMethod<CreateTagDto>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((dto) =>
          tagService.create(dto).pipe(
            tap((newTag: Tag) => {
              patchState(store, {
                tags: [...store.tags(), newTag],
                loading: false,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: error.message,
                loading: false
              });
              console.error('Failed to add tag:', error);
              return of(null);
            })
          )
        )
      )
    ),

    updateTag: rxMethod<{ id: string; updates: UpdateTagDto }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, updates }) =>
          tagService.update(id, updates).pipe(
            tap((updatedTag: Tag) => {
              patchState(store, {
                tags: store.tags().map((t) =>
                  t.id === id ? updatedTag : t
                ),
                loading: false,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: error.message,
                loading: false
              });
              console.error('Failed to update tag:', error);
              return of(null);
            })
          )
        )
      )
    ),

    deleteTag: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          tagService.deleteTag(id).pipe(
            tap(() => {
              patchState(store, {
                tags: store.tags().filter((t) => t.id !== id),
                selectedTag:
                  store.selectedTag()?.id === id
                    ? null
                    : store.selectedTag(),
                loading: false,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: error.message,
                loading: false
              });
              console.error('Failed to delete tag:', error);
              return of(null);
            })
          )
        )
      )
    ),

    updateFilters(filters: Partial<TagFilters>) {
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
