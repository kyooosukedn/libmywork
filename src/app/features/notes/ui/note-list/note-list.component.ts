import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Note } from '@core/models';
import { NoteCardComponent } from '../note-card/note-card.component';

@Component({
  selector: 'app-note-list',
  standalone: true,
  imports: [CommonModule, NoteCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngIf="notes.length === 0"
      class="flex flex-col items-center justify-center py-16 px-4"
    >
      <div class="w-24 h-24 mb-6 text-gray-300 dark:text-gray-600">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        No notes yet
      </h3>
      <p class="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-sm">
        Get started by creating your first note. Click the button above to begin.
      </p>
      <button
        (click)="onCreateClick()"
        class="btn btn-primary"
      >
        <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Note
      </button>
    </div>

    <div
      *ngIf="notes.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <app-note-card
        *ngFor="let note of notes; trackBy: trackByNoteId"
        [note]="note"
        (pinToggled)="onPinToggled($event)"
        (viewed)="onNoteViewed($event)"
        (edited)="onNoteEdited($event)"
        (deleted)="onNoteDeleted($event)"
      />
    </div>
  `,
})
export class NoteListComponent {
  @Input() notes: Note[] = [];

  @Output() pinToggled = new EventEmitter<string>();
  @Output() noteViewed = new EventEmitter<string>();
  @Output() noteEdited = new EventEmitter<string>();
  @Output() noteDeleted = new EventEmitter<string>();
  @Output() createClicked = new EventEmitter<void>();

  trackByNoteId(_index: number, note: Note): string {
    return note.id;
  }

  onPinToggled(id: string): void {
    this.pinToggled.emit(id);
  }

  onNoteViewed(id: string): void {
    this.noteViewed.emit(id);
  }

  onNoteEdited(id: string): void {
    this.noteEdited.emit(id);
  }

  onNoteDeleted(id: string): void {
    this.noteDeleted.emit(id);
  }

  onCreateClick(): void {
    this.createClicked.emit();
  }
}
