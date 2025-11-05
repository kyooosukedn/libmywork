import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesStore } from '../../categories.store';
import { CategoryTreeListComponent } from '../../ui/category-tree-list/category-tree-list.component';
import { CategoryFormComponent } from '../../ui/category-form/category-form.component';
import { Category, CreateCategoryDto } from '@core/models';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [
    CommonModule,
    CategoryTreeListComponent,
    CategoryFormComponent,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Organize resources and notes with hierarchical categories
          </p>
        </div>
        <button
          (click)="onCreateCategory()"
          class="btn btn-primary"
        >
          <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Category
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Categories</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ stats().total }}
              </p>
            </div>
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Root Categories</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ stats().rootCategories }}
              </p>
            </div>
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <span class="text-2xl">📂</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Max Depth</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ stats().maxDepth }}
              </p>
            </div>
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <span class="text-2xl">🌳</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ stats().totalResources + stats().totalNotes }}
              </p>
            </div>
            <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <span class="text-2xl">📊</span>
            </div>
          </div>
        </div>
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

      <app-category-tree-list
        [categories]="categoryTree()"
        (categoryEdited)="onEditCategory($event)"
        (categoryDeleted)="onDeleteCategory($event)"
        (createClicked)="onCreateCategory()"
      />

      <app-category-form
        [isOpen]="isFormOpen()"
        [category]="editingCategory()"
        [availableParents]="sortedCategories()"
        [isSubmitting]="loading()"
        (closed)="onFormClosed()"
        (submitted)="onFormSubmitted($event)"
      />
    </div>
  `,
})
export class CategoriesPageComponent implements OnInit {
  private store = inject(CategoriesStore);
  private toastService = inject(ToastService);

  categoryTree = this.store.categoryTree;
  sortedCategories = this.store.sortedCategories;
  stats = this.store.stats;
  loading = this.store.loading;
  error = this.store.error;

  isFormOpen = signal(false);
  editingCategory = signal<Category | null>(null);

  ngOnInit(): void {
    this.store.loadCategories();
  }

  onCreateCategory(): void {
    this.editingCategory.set(null);
    this.isFormOpen.set(true);
  }

  onEditCategory(id: string): void {
    const category = this.store.categories().find(c => c.id === id);
    if (category) {
      this.editingCategory.set(category);
      this.isFormOpen.set(true);
    }
  }

  onDeleteCategory(id: string): void {
    if (confirm('Are you sure you want to delete this category? This cannot be undone.')) {
      this.store.deleteCategory(id);
      this.toastService.success('Category deleted successfully!');
    }
  }

  onFormClosed(): void {
    this.isFormOpen.set(false);
    this.editingCategory.set(null);
  }

  onFormSubmitted(data: CreateCategoryDto): void {
    if (this.editingCategory()) {
      this.store.updateCategory({
        id: this.editingCategory()!.id,
        updates: data
      });
      this.toastService.success('Category updated successfully!');
    } else {
      this.store.addCategory(data);
      this.toastService.success('Category created successfully!');
    }
    this.onFormClosed();
  }

  clearError(): void {
    this.store.clearError();
  }
}
