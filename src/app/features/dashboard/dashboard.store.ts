import { computed, inject } from '@angular/core';
import { signalStore, withComputed, withHooks, withState } from '@ngrx/signals';
import { NotesStore } from '../notes/notes.store';
import { ResourcesStore } from '../resources/resources.store';
import { CategoriesStore } from '../categories/categories.store';
import { TagsStore } from '../tags/tags.store';

interface DashboardStats {
  resources: {
    total: number;
    favorites: number;
    archived: number;
  };
  notes: {
    total: number;
    pinned: number;
    archived: number;
    totalWords: number;
  };
  categories: {
    total: number;
  };
  tags: {
    total: number;
    totalUsage: number;
  };
}

interface DashboardState {
  initialized: boolean;
}

const initialState: DashboardState = {
  initialized: false,
};

export const DashboardStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed(() => {
    const notesStore = inject(NotesStore);
    const resourcesStore = inject(ResourcesStore);
    const categoriesStore = inject(CategoriesStore);
    const tagsStore = inject(TagsStore);

    return {
      stats: computed((): DashboardStats => ({
        resources: {
          total: resourcesStore.resources().length,
          favorites: resourcesStore.resources().filter(r => r.isFavorite).length,
          archived: resourcesStore.resources().filter(r => r.isArchived).length,
        },
        notes: {
          total: notesStore.notes().length,
          pinned: notesStore.pinnedNotes().length,
          archived: notesStore.notes().filter(n => n.isArchived).length,
          totalWords: notesStore.stats().totalWords,
        },
        categories: {
          total: categoriesStore.categories().length,
        },
        tags: {
          total: tagsStore.tags().length,
          totalUsage: tagsStore.stats().totalUsage,
        },
      })),

      loading: computed(() => 
        notesStore.loading() || 
        resourcesStore.loading() || 
        categoriesStore.loading() || 
        tagsStore.loading()
      ),

      hasData: computed(() => 
        notesStore.notes().length > 0 || 
        resourcesStore.resources().length > 0 || 
        categoriesStore.categories().length > 0 ||
        tagsStore.tags().length > 0
      ),
    };
  }),

  withHooks({
    onInit(store) {
      const notesStore = inject(NotesStore);
      const resourcesStore = inject(ResourcesStore);
      const categoriesStore = inject(CategoriesStore);
      const tagsStore = inject(TagsStore);

      // Load all data for dashboard
      notesStore.loadNotes();
      resourcesStore.loadResources();
      categoriesStore.loadCategories();
      tagsStore.loadTags();
    },
  })
);
