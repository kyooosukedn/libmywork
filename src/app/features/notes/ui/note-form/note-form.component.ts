import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Note, CreateNoteDto } from '@core/models';

@Component({
  selector: 'app-note-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      (click)="onOverlayClick($event)"
    >
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

      <div class="flex min-h-screen items-center justify-center p-4">
        <div
          class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl transform transition-all"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ isEditMode ? 'Edit Note' : 'Create New Note' }}
            </h2>
            <button
              type="button"
              (click)="onClose()"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title <span class="text-danger-500">*</span>
              </label>
              <input
                type="text"
                formControlName="title"
                placeholder="Enter note title..."
                class="input"
                [class.border-danger-500]="isFieldInvalid('title')"
              />
              <p *ngIf="isFieldInvalid('title')" class="mt-1 text-sm text-danger-600 dark:text-danger-400">
                Title is required (min 3 characters)
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content <span class="text-danger-500">*</span>
              </label>
              <textarea
                formControlName="content"
                rows="12"
                placeholder="Write your note here... Markdown supported!"
                class="input resize-none font-mono text-sm"
                [class.border-danger-500]="isFieldInvalid('content')"
              ></textarea>
              <p *ngIf="isFieldInvalid('content')" class="mt-1 text-sm text-danger-600 dark:text-danger-400">
                Content is required (min 10 characters)
              </p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Supports Markdown: **bold**, *italic*, [link](url), # heading, etc.
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category ID
              </label>
              <input
                type="text"
                formControlName="categoryId"
                placeholder="Enter category ID..."
                class="input"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Temporary: Enter category ID (would be dropdown in production)
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                formControlName="tagsInput"
                placeholder="react, tutorial, frontend (comma-separated)"
                class="input"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter tags separated by commas
              </p>
            </div>

            <div class="flex items-center">
              <input
                type="checkbox"
                id="isPinned"
                formControlName="isPinned"
                class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label for="isPinned" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Pin this note
              </label>
            </div>

            <div class="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                (click)="onClose()"
                class="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="form.invalid || isSubmitting"
                class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span *ngIf="!isSubmitting">
                  {{ isEditMode ? 'Update' : 'Create' }}
                </span>
                <span *ngIf="isSubmitting" class="flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isEditMode ? 'Updating...' : 'Creating...' }}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class NoteFormComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() note: Note | null = null;
  @Input() isSubmitting = false;

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<CreateNoteDto>();

  form!: FormGroup;

  get isEditMode(): boolean {
    return !!this.note;
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['note'] && this.form) {
      this.updateFormWithNote();
    }
    if (changes['isOpen'] && !changes['isOpen'].currentValue) {
      if (this.form) {
        this.form.reset();
      }
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      categoryId: [''],
      tagsInput: [''],
      isPinned: [false],
    });

    this.updateFormWithNote();
  }

  private updateFormWithNote(): void {
    if (this.note) {
      this.form.patchValue({
        title: this.note.title,
        content: this.note.content,
        categoryId: this.note.categoryId || '',
        tagsInput: this.note.tags.join(', '),
        isPinned: this.note.isPinned,
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach((key) => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.form.value;

    const tags = formValue.tagsInput
      ? formValue.tagsInput.split(',').map((tag: string) => tag.trim()).filter(Boolean)
      : [];

    const noteData: CreateNoteDto = {
      title: formValue.title,
      content: formValue.content,
      categoryId: formValue.categoryId || '1',
      tags,
      isPinned: formValue.isPinned,
      isArchived: false,
      metadata: {},
    };

    this.submitted.emit(noteData);
  }

  onClose(): void {
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
