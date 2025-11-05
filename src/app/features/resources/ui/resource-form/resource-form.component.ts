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
import { Resource, ResourceType, CreateResourceDto } from '@core/models';

@Component({
  selector: 'app-resource-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      (click)="onOverlayClick($event)"
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

      <!-- Modal Container -->
      <div class="flex min-h-screen items-center justify-center p-4">
        <!-- Modal Content -->
        <div
          class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ isEditMode ? 'Edit Resource' : 'Create New Resource' }}
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

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-6">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title <span class="text-danger-500">*</span>
              </label>
              <input
                type="text"
                formControlName="title"
                placeholder="Enter resource title..."
                class="input"
                [class.border-danger-500]="isFieldInvalid('title')"
              />
              <p *ngIf="isFieldInvalid('title')" class="mt-1 text-sm text-danger-600 dark:text-danger-400">
                Title is required
              </p>
            </div>

            <!-- Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type <span class="text-danger-500">*</span>
              </label>
              <select formControlName="type" class="input" [class.border-danger-500]="isFieldInvalid('type')">
                <option value="">Select type...</option>
                <option [value]="ResourceType.Document">📄 Document</option>
                <option [value]="ResourceType.Link">🔗 Link</option>
                <option [value]="ResourceType.Video">🎥 Video</option>
                <option [value]="ResourceType.Code">💻 Code</option>
                <option [value]="ResourceType.File">📁 File</option>
              </select>
              <p *ngIf="isFieldInvalid('type')" class="mt-1 text-sm text-danger-600 dark:text-danger-400">
                Type is required
              </p>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description <span class="text-danger-500">*</span>
              </label>
              <textarea
                formControlName="description"
                rows="4"
                placeholder="Describe this resource..."
                class="input resize-none"
                [class.border-danger-500]="isFieldInvalid('description')"
              ></textarea>
              <p *ngIf="isFieldInvalid('description')" class="mt-1 text-sm text-danger-600 dark:text-danger-400">
                Description is required
              </p>
            </div>

            <!-- URL (for links and videos) -->
            <div *ngIf="shouldShowUrl()">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL <span class="text-danger-500">*</span>
              </label>
              <input
                type="url"
                formControlName="url"
                placeholder="https://example.com"
                class="input"
                [class.border-danger-500]="isFieldInvalid('url')"
              />
              <p *ngIf="isFieldInvalid('url')" class="mt-1 text-sm text-danger-600 dark:text-danger-400">
                Valid URL is required
              </p>
            </div>

            <!-- Category ID (simplified - would be a dropdown in real app) -->
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

            <!-- Tags (simplified - would be multi-select in real app) -->
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

            <!-- Favorite Toggle -->
            <div class="flex items-center">
              <input
                type="checkbox"
                id="isFavorite"
                formControlName="isFavorite"
                class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label for="isFavorite" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Mark as favorite
              </label>
            </div>

            <!-- Footer Actions -->
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
export class ResourceFormComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() resource: Resource | null = null;
  @Input() isSubmitting = false;

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<CreateResourceDto>();

  form!: FormGroup;
  ResourceType = ResourceType;

  get isEditMode(): boolean {
    return !!this.resource;
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resource'] && this.form) {
      this.updateFormWithResource();
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
      description: ['', [Validators.required, Validators.minLength(10)]],
      type: ['', Validators.required],
      url: [''],
      categoryId: [''],
      tagsInput: [''],
      isFavorite: [false],
    });

    this.form.get('type')?.valueChanges.subscribe((type) => {
      const urlControl = this.form.get('url');
      if (type === ResourceType.Link || type === ResourceType.Video) {
        urlControl?.setValidators([Validators.required, Validators.pattern(/^https?:\/\/.+/)]);
      } else {
        urlControl?.clearValidators();
      }
      urlControl?.updateValueAndValidity();
    });

    this.updateFormWithResource();
  }

  private updateFormWithResource(): void {
    if (this.resource) {
      this.form.patchValue({
        title: this.resource.title,
        description: this.resource.description,
        type: this.resource.type,
        url: this.resource.url || '',
        categoryId: this.resource.categoryId || '',
        tagsInput: this.resource.tags.join(', '),
        isFavorite: this.resource.isFavorite,
      });
    }
  }

  shouldShowUrl(): boolean {
    const type = this.form.get('type')?.value;
    return type === ResourceType.Link || type === ResourceType.Video;
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

    const resourceData: CreateResourceDto = {
      title: formValue.title,
      description: formValue.description,
      type: formValue.type,
      url: formValue.url || undefined,
      categoryId: formValue.categoryId || '1', // Default category
      tags,
      isFavorite: formValue.isFavorite,
      isArchived: false,
      metadata: {},
    };

    this.submitted.emit(resourceData);
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
