import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesStore } from '../../notes.store';
import { NoteListComponent } from '../../ui/note-list/note-list.component';
import { NoteSearchComponent } from '../../ui/note-search/note-search.component';
import { NoteFormComponent } from '../../ui/note-form/note-form.component';
import { Note, CreateNoteDto } from '@core/models';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-notes-page',
  standalone: true,
  imports: [
    CommonModule,
    NoteListComponent,
    NoteSearchComponent,
    NoteFormComponent,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Notes</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Create and organize your notes with markdown support
          </p>
        </div>
        <button
          (click)="onCreateNote()"
          class="btn btn-primary"
        >
          <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Note
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Notes</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ stats().total }}
              </p>
            </div>
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Pinned</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ stats().pinned }}
              </p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <span class="text-2xl">📌</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Words</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ stats().totalWords }}
              </p>
            </div>
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span class="text-2xl">📝</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Archived</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ stats().archived }}
              </p>
            </div>
            <div class="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
              <span class="text-2xl">📦</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <app-note-search
          [searchTerm]="filters().search"
          (searchChanged)="onSearchChanged($event)"
        />
      </div>

      <div *ngIf="loading()" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>

      <div *ngIf="error()" class="card bg-danger-50 dark:bg-danger-900 border-danger-200 dark:border-danger-700">
        <div class="flex items-start gap-3">
          <svg class="w-6 h-6 text-danger-600 dark:text-danger-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <h3 class="text-danger-800 dark:text-danger-200 font-semibold">Error</h3>
            <p class="text-danger-700 dark:text-danger-300 mt-1">{{ error() }}</p>
          </div>
          <button
            (click)="clearError()"
            class="text-danger-600 hover:text-danger-800 dark:text-danger-400"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <app-note-list
        [notes]="filteredNotes()"
        (pinToggled)="onTogglePin($event)"
        (noteViewed)="onViewNote($event)"
        (noteEdited)="onEditNote($event)"
        (noteDeleted)="onDeleteNote($event)"
        (createClicked)="onCreateNote()"
      />

      <app-note-form
        [isOpen]="isFormOpen()"
        [note]="editingNote()"
        [isSubmitting]="loading()"
        (closed)="onFormClosed()"
        (submitted)="onFormSubmitted($event)"
      />
    </div>
  `,
})
export class NotesPageComponent implements OnInit {
  private store = inject(NotesStore);
  private toastService = inject(ToastService);

  filteredNotes = this.store.filteredNotes;
  stats = this.store.stats;
  loading = this.store.loading;
  error = this.store.error;
  filters = this.store.filters;

  isFormOpen = signal(false);
  editingNote = signal<Note | null>(null);

  ngOnInit(): void {
    this.store.loadNotes();
  }

  onSearchChanged(searchTerm: string): void {
    this.store.updateFilters({ search: searchTerm });
  }

  onTogglePin(id: string): void {
    const note = this.store.notes().find(n => n.id === id);
    const wasPinned = note?.isPinned;
    this.store.togglePin(id);

    if (wasPinned) {
      this.toastService.info('Note unpinned');
    } else {
      this.toastService.success('Note pinned!');
    }
  }

  onViewNote(id: string): void {
    console.log('View note:', id);
  }

  onEditNote(id: string): void {
    const note = this.store.notes().find(n => n.id === id);
    if (note) {
      this.editingNote.set(note);
      this.isFormOpen.set(true);
    }
  }

  onDeleteNote(id: string): void {
    if (confirm('Are you sure you want to delete this note?')) {
      this.store.deleteNote(id);
      this.toastService.success('Note deleted successfully!');
    }
  }

  onCreateNote(): void {
    this.editingNote.set(null);
    this.isFormOpen.set(true);
  }

  onFormClosed(): void {
    this.isFormOpen.set(false);
    this.editingNote.set(null);
  }

  onFormSubmitted(data: CreateNoteDto): void {
    if (this.editingNote()) {
      this.store.updateNote({
        id: this.editingNote()!.id,
        updates: data
      });
      this.toastService.success('Note updated successfully!');
    } else {
      this.store.addNote(data);
      this.toastService.success('Note created successfully!');
    }
    this.onFormClosed();
  }

  clearError(): void {
    this.store.clearError();
  }
}
