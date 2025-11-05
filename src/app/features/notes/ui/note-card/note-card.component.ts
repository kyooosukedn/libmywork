import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Note } from '@core/models';
import { format } from 'date-fns';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card group hover:shadow-xl transition-all duration-200 relative">
      <div
        *ngIf="note.isPinned"
        class="absolute top-2 right-2 text-yellow-500"
        title="Pinned"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
        </svg>
      </div>

      <div class="cursor-pointer" (click)="onView()">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 pr-8">
          {{ note.title }}
        </h3>

        <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {{ getContentPreview() }}
        </p>

        <div *ngIf="note.tags.length > 0" class="flex flex-wrap gap-2 mb-3">
          <span
            *ngFor="let tag of note.tags.slice(0, 3)"
            class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
          >
            {{ tag }}
          </span>
          <span
            *ngIf="note.tags.length > 3"
            class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
          >
            +{{ note.tags.length - 3 }} more
          </span>
        </div>

        <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ formatDate(note.updatedAt) }}
          </span>
          <span *ngIf="note.metadata.wordCount" class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {{ note.metadata.wordCount }} words
          </span>
          <span *ngIf="note.metadata.readingTimeMinutes" class="flex items-center gap-1">
            📖 {{ note.metadata.readingTimeMinutes }} min read
          </span>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          (click)="onPin()"
          [class.text-yellow-500]="note.isPinned"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          [title]="note.isPinned ? 'Unpin' : 'Pin'"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
          </svg>
        </button>

        <button
          (click)="onEdit()"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
          title="Edit"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        <button
          (click)="onDelete()"
          class="p-2 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors text-danger-600 dark:text-danger-400"
          title="Delete"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class NoteCardComponent {
  @Input({ required: true }) note!: Note;

  @Output() pinToggled = new EventEmitter<string>();
  @Output() viewed = new EventEmitter<string>();
  @Output() edited = new EventEmitter<string>();
  @Output() deleted = new EventEmitter<string>();

  getContentPreview(): string {
    return this.note.content
      .replace(/[#*_`~\[\]]/g, '')
      .substring(0, 150);
  }

  formatDate(date: Date): string {
    return format(new Date(date), 'MMM d, yyyy');
  }

  onPin(): void {
    this.pinToggled.emit(this.note.id);
  }

  onView(): void {
    this.viewed.emit(this.note.id);
  }

  onEdit(): void {
    this.edited.emit(this.note.id);
  }

  onDelete(): void {
    this.deleted.emit(this.note.id);
  }
}
