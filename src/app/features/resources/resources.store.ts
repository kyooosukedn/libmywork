import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';

import {
  Resource,
  ResourceFilters,
  ResourceType,
  CreateResourceDto,
  UpdateResourceDto,
  ResourceStats
} from '@core/models';
import { ResourceService } from './data/resource.service';

interface ResourcesState {
  resources: Resource[];
  selectedResource: Resource | null;
  loading: boolean;
  error: string | null;
  filters: ResourceFilters;
}

const initialState: ResourcesState = {
  resources: [],
  selectedResource: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    type: null,
    categoryId: null,
    tags: [],
    isFavorite: false,
    isArchived: false,
  },
};

export const ResourcesStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => ({
    filteredResources: computed(() => {
      const resources = store.resources();
      const filters = store.filters();

      return resources.filter((resource) => {
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const matchesSearch =
            resource.title.toLowerCase().includes(searchLower) ||
            resource.description.toLowerCase().includes(searchLower);
          if (!matchesSearch) return false;
        }

        if (filters.type && resource.type !== filters.type) {
          return false;
        }

        if (filters.categoryId && resource.categoryId !== filters.categoryId) {
          return false;
        }

        if (filters.tags.length > 0) {
          const hasAllTags = filters.tags.every((tag) =>
            resource.tags.includes(tag)
          );
          if (!hasAllTags) return false;
        }

        if (filters.isFavorite && !resource.isFavorite) {
          return false;
        }

        if (resource.isArchived !== filters.isArchived) {
          return false;
        }

        return true;
      });
    }),

    favoriteResources: computed(() =>
      store.resources().filter((r) => r.isFavorite && !r.isArchived)
    ),

    resourcesByType: computed(() => {
      const resources = store.resources();
      return {
        documents: resources.filter((r) => r.type === ResourceType.Document),
        links: resources.filter((r) => r.type === ResourceType.Link),
        videos: resources.filter((r) => r.type === ResourceType.Video),
        code: resources.filter((r) => r.type === ResourceType.Code),
        files: resources.filter((r) => r.type === ResourceType.File),
      };
    }),

    stats: computed((): ResourceStats => {
      const resources = store.resources();
      return {
        total: resources.length,
        favorites: resources.filter((r) => r.isFavorite).length,
        archived: resources.filter((r) => r.isArchived).length,
        byType: {
          documents: resources.filter((r) => r.type === ResourceType.Document).length,
          links: resources.filter((r) => r.type === ResourceType.Link).length,
          videos: resources.filter((r) => r.type === ResourceType.Video).length,
          code: resources.filter((r) => r.type === ResourceType.Code).length,
          files: resources.filter((r) => r.type === ResourceType.File).length,
        },
      };
    }),

    hasActiveFilters: computed(() => {
      const filters = store.filters();
      return (
        filters.search !== '' ||
        filters.type !== null ||
        filters.categoryId !== null ||
        filters.tags.length > 0 ||
        filters.isFavorite === true
      );
    }),

    filteredCount: computed(() => {
      const filtered = store.resources().filter((resource) => {
        const filters = store.filters();
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const matchesSearch =
            resource.title.toLowerCase().includes(searchLower) ||
            resource.description.toLowerCase().includes(searchLower);
          if (!matchesSearch) return false;
        }
        if (filters.type && resource.type !== filters.type) return false;
        if (filters.categoryId && resource.categoryId !== filters.categoryId) return false;
        if (filters.tags.length > 0) {
          const hasAllTags = filters.tags.every((tag) =>
            resource.tags.includes(tag)
          );
          if (!hasAllTags) return false;
        }
        if (filters.isFavorite && !resource.isFavorite) return false;
        if (resource.isArchived !== filters.isArchived) return false;
        return true;
      });
      return filtered.length;
    }),
  })),

  withMethods((store, resourceService = inject(ResourceService)) => ({
    loadResources: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          resourceService.getAll().pipe(
            tap((resources: Resource[]) => {
              patchState(store, {
                resources,
                loading: false
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: error.message,
                loading: false
              });
              console.error('Failed to load resources:', error);
              return of([]);
            })
          )
        )
      )
    ),

    selectResource(id: string) {
      const resource = store.resources().find((r) => r.id === id) || null;
      patchState(store, { selectedResource: resource });
    },

    clearSelection() {
      patchState(store, { selectedResource: null });
    },

    addResource: rxMethod<CreateResourceDto>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((dto) =>
          resourceService.create(dto).pipe(
            tap((newResource: Resource) => {
              patchState(store, {
                resources: [...store.resources(), newResource],
                loading: false,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: error.message,
                loading: false
              });
              console.error('Failed to add resource:', error);
              return of(null);
            })
          )
        )
      )
    ),

    updateResource: rxMethod<{ id: string; updates: UpdateResourceDto }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, updates }) =>
          resourceService.update(id, updates).pipe(
            tap((updatedResource: Resource) => {
              patchState(store, {
                resources: store.resources().map((r) =>
                  r.id === id ? updatedResource : r
                ),
                loading: false,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: error.message,
                loading: false
              });
              console.error('Failed to update resource:', error);
              return of(null);
            })
          )
        )
      )
    ),

    deleteResource: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          resourceService.deleteResource(id).pipe(
            tap(() => {
              patchState(store, {
                resources: store.resources().filter((r) => r.id !== id),
                selectedResource:
                  store.selectedResource()?.id === id
                    ? null
                    : store.selectedResource(),
                loading: false,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: error.message,
                loading: false
              });
              console.error('Failed to delete resource:', error);
              return of(null);
            })
          )
        )
      )
    ),

    toggleFavorite(id: string) {
      const resource = store.resources().find((r) => r.id === id);
      if (!resource) return;

      const isFavorite = !resource.isFavorite;

      patchState(store, {
        resources: store.resources().map((r) =>
          r.id === id ? { ...r, isFavorite } : r
        ),
      });

      resourceService.toggleFavorite(id, isFavorite).subscribe({
        error: (error) => {
          patchState(store, {
            resources: store.resources().map((r) =>
              r.id === id ? { ...r, isFavorite: !isFavorite } : r
            ),
            error: error.message,
          });
          console.error('Failed to toggle favorite:', error);
        },
      });
    },

    updateFilters(filters: Partial<ResourceFilters>) {
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
