import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';

import {
  Note,
  NoteFilters,
  CreateNoteDto,
  UpdateNoteDto,
  NoteStats
} from '@core/models';
import { NoteService } from './data/note.service';

interface NotesState {
  notes: Note[];
  selectedNote: Note | null;
  loading: boolean;
  error: string | null;
  filters: NoteFilters;
}

const initialState: NotesState = {
  notes: [],
  selectedNote: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    categoryId: null,
    tags: [],
    isPinned: false,
    isArchived: false,
  },
};

export const NotesStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => ({
    filteredNotes: computed(() => {
      const notes = store.notes();
      const filters = store.filters();

      let filtered = notes.filter((note) => {
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const matchesSearch =
            note.title.toLowerCase().includes(searchLower) ||
            note.content.toLowerCase().includes(searchLower);
          if (!matchesSearch) return false;
        }

        if (filters.categoryId && note.categoryId !== filters.categoryId) {
          return false;
        }

        if (filters.tags.length > 0) {
          const hasAllTags = filters.tags.every((tag) =>
            note.tags.includes(tag)
          );
          if (!hasAllTags) return false;
        }

        if (filters.isPinned && !note.isPinned) {
          return false;
        }

        if (note.isArchived !== filters.isArchived) {
          return false;
        }

        return true;
      });

      return filtered.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    }),

    pinnedNotes: computed(() =>
      store.notes().filter((n) => n.isPinned && !n.isArchived)
    ),

    stats: computed((): NoteStats => {
      const notes = store.notes();
      const totalWords = notes.reduce((sum, note) =>
        sum + (note.metadata.wordCount || 0), 0
      );

      return {
        total: notes.length,
        pinned: notes.filter((n) => n.isPinned).length,
        archived: notes.filter((n) => n.isArchived).length,
        totalWords,
      };
    }),

    hasActiveFilters: computed(() => {
      const filters = store.filters();
      return (
        filters.search !== '' ||
        filters.categoryId !== null ||
        filters.tags.length > 0 ||
        filters.isPinned === true
      );
    }),
  })),

  withMethods((store, noteService = inject(NoteService)) => ({
    loadNotes: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          noteService.getAll().pipe(
            tap((notes: Note[]) => {
              patchState(store, {
                notes,
                loading: false
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: error.message,
                loading: false
              });
              console.error('Failed to load notes:', error);
              return of([]);
            })
          )
        )
      )
    ),

    selectNote(id: string) {
      const note = store.notes().find((n) => n.id === id) || null;
      patchState(store, { selectedNote: note });
    },

    clearSelection() {
      patchState(store, { selectedNote: null });
    },

    addNote: rxMethod<CreateNoteDto>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((dto) =>
          noteService.create(dto).pipe(
            tap((newNote: Note) => {
              patchState(store, {
                notes: [...store.notes(), newNote],
                loading: false,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: error.message,
                loading: false
              });
              console.error('Failed to add note:', error);
              return of(null);
            })
          )
        )
      )
    ),

    updateNote: rxMethod<{ id: string; updates: UpdateNoteDto }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, updates }) =>
          noteService.update(id, updates).pipe(
            tap((updatedNote: Note) => {
              patchState(store, {
                notes: store.notes().map((n) =>
                  n.id === id ? updatedNote : n
                ),
                loading: false,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: error.message,
                loading: false
              });
              console.error('Failed to update note:', error);
              return of(null);
            })
          )
        )
      )
    ),

    deleteNote: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          noteService.deleteNote(id).pipe(
            tap(() => {
              patchState(store, {
                notes: store.notes().filter((n) => n.id !== id),
                selectedNote:
                  store.selectedNote()?.id === id
                    ? null
                    : store.selectedNote(),
                loading: false,
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                error: error.message,
                loading: false
              });
              console.error('Failed to delete note:', error);
              return of(null);
            })
          )
        )
      )
    ),

    togglePin(id: string) {
      const note = store.notes().find((n) => n.id === id);
      if (!note) return;

      const isPinned = !note.isPinned;

      patchState(store, {
        notes: store.notes().map((n) =>
          n.id === id ? { ...n, isPinned } : n
        ),
      });

      noteService.togglePin(id, isPinned).subscribe({
        error: (error) => {
          patchState(store, {
            notes: store.notes().map((n) =>
              n.id === id ? { ...n, isPinned: !isPinned } : n
            ),
            error: error.message,
          });
          console.error('Failed to toggle pin:', error);
        },
      });
    },

    updateFilters(filters: Partial<NoteFilters>) {
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
