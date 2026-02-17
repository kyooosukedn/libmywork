import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Tag } from '@core/models';

@Component({
  selector: 'app-tag-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="card">
      <h2 class="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
        {{ tag ? 'Edit Tag' : 'Create Tag' }}
      </h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tag Name
          </label>
          <input
            type="text"
            formControlName="name"
            placeholder="Enter tag name"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            [class.border-danger-500]="form.get('name')?.invalid && form.get('name')?.touched"
          />
          <p 
            *ngIf="form.get('name')?.invalid && form.get('name')?.touched"
            class="mt-1 text-sm text-danger-600 dark:text-danger-400"
          >
            Tag name is required and must be at least 2 characters
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color
          </label>
          <div class="flex gap-2">
            <input
              type="color"
              formControlName="color"
              class="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <input
              type="text"
              formControlName="color"
              placeholder="#3b82f6"
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Choose a color to represent this tag
          </p>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="submit"
            [disabled]="form.invalid || loading"
            class="btn btn-primary flex-1"
          >
            {{ loading ? 'Saving...' : (tag ? 'Update Tag' : 'Create Tag') }}
          </button>
          <button
            type="button"
            (click)="onCancel()"
            [disabled]="loading"
            class="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  `,
})
export class TagFormComponent implements OnInit {
  @Input() tag: Tag | null = null;
  @Input() loading = false;
  @Output() submit = new EventEmitter<{ name: string; color: string }>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      color: ['#3b82f6', [Validators.required]],
    });
  }

  ngOnInit() {
    if (this.tag) {
      this.form.patchValue({
        name: this.tag.name,
        color: this.tag.color,
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.submit.emit(this.form.value);
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
