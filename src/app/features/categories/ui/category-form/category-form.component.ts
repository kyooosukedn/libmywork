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
import { Category, CreateCategoryDto } from '@core/models';

@Component({
  selector: 'app-category-form',
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
          class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg transform transition-all"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ isEditMode ? 'Edit Category' : 'Create New Category' }}
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

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name <span class="text-danger-500">*</span>
              </label>
              <input
                type="text"
                formControlName="name"
                placeholder="Enter category name..."
                class="input"
                [class.border-danger-500]="isFieldInvalid('name')"
              />
              <p *ngIf="isFieldInvalid('name')" class="mt-1 text-sm text-danger-600 dark:text-danger-400">
                Category name is required (min 2 characters)
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                formControlName="description"
                rows="3"
                placeholder="Optional description..."
                class="input resize-none"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  formControlName="icon"
                  placeholder="📁"
                  maxlength="2"
                  class="input text-center text-2xl"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  formControlName="color"
                  class="input h-12 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Parent Category
              </label>
              <select
                formControlName="parentId"
                class="input"
              >
                <option [value]="null">None (Root Category)</option>
                <option
                  *ngFor="let cat of availableParents"
                  [value]="cat.id"
                >
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
export class CategoryFormComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() category: Category | null = null;
  @Input() availableParents: Category[] = [];
  @Input() isSubmitting = false;

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<CreateCategoryDto>();

  form!: FormGroup;

  get isEditMode(): boolean {
    return !!this.category;
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category'] && this.form) {
      this.updateFormWithCategory();
    }
    if (changes['isOpen'] && !changes['isOpen'].currentValue) {
      if (this.form) {
        this.form.reset();
      }
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      icon: ['📁'],
      color: ['#3b82f6'],
      parentId: [null],
      order: [0],
    });

    this.updateFormWithCategory();
  }

  private updateFormWithCategory(): void {
    if (this.category) {
      this.form.patchValue({
        name: this.category.name,
        description: this.category.description || '',
        icon: this.category.icon || '📁',
        color: this.category.color || '#3b82f6',
        parentId: this.category.parentId,
        order: this.category.order,
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

    const categoryData: CreateCategoryDto = {
      name: formValue.name,
      description: formValue.description || undefined,
      icon: formValue.icon || undefined,
      color: formValue.color || undefined,
      parentId: formValue.parentId || null,
      order: formValue.order || 0,
      metadata: {
        resourceCount: 0,
        noteCount: 0,
        childrenCount: 0,
      },
    };

    this.submitted.emit(categoryData);
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
