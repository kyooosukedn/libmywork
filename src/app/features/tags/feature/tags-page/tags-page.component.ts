import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagsStore } from '../../tags.store';
import { TagCardComponent } from '../../ui/tag-card/tag-card.component';
import { TagFormComponent } from '../../ui/tag-form/tag-form.component';
import { Tag } from '@core/models';

@Component({
  selector: 'app-tags-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TagCardComponent, TagFormComponent],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Tags</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Manage tags for flexible organization
          </p>
        </div>
        <button 
          *ngIf="!showForm"
          (click)="openForm()"
          class="btn btn-primary"
        >
          Add Tag
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tags</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {{ store.stats().total }}
          </p>
        </div>
        <div class="card">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Usage</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {{ store.stats().totalUsage }}
          </p>
        </div>
        <div class="card">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Most Used</p>
          <p class="text-lg font-bold text-gray-900 dark:text-white mt-2">
            {{ store.stats().mostUsed?.name || 'N/A' }}
          </p>
        </div>
      </div>

      <!-- Search -->
      <div class="card">
        <div class="flex gap-4">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search tags..."
            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <select
            [(ngModel)]="sortBy"
            (ngModelChange)="onSortChange()"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="usageCount">Sort by Usage</option>
            <option value="createdAt">Sort by Date</option>
          </select>
        </div>
      </div>

      <!-- Form -->
      <app-tag-form
        *ngIf="showForm"
        [tag]="selectedTag"
        [loading]="store.loading()"
        (submit)="onSubmit($event)"
        (cancel)="closeForm()"
      />

      <!-- Loading -->
      <div *ngIf="store.loading() && !showForm" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="text-gray-600 dark:text-gray-400 mt-4">Loading tags...</p>
      </div>

      <!-- Error -->
      <div *ngIf="store.error()" class="card bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800">
        <p class="text-danger-600 dark:text-danger-400">{{ store.error() }}</p>
      </div>

      <!-- Tags Grid -->
      <div 
        *ngIf="!store.loading() && store.filteredTags().length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <app-tag-card
          *ngFor="let tag of store.filteredTags()"
          [tag]="tag"
          (edit)="onEdit($event)"
          (delete)="onDelete($event)"
          (click)="onTagClick($event)"
        />
      </div>

      <!-- Empty State -->
      <div 
        *ngIf="!store.loading() && store.filteredTags().length === 0 && !showForm"
        class="card text-center py-12"
      >
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {{ store.hasActiveFilters() ? 'No tags found' : 'No tags yet' }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          {{ store.hasActiveFilters() 
            ? 'Try adjusting your search criteria' 
            : 'Create tags to cross-reference your content' 
          }}
        </p>
        <button 
          *ngIf="!store.hasActiveFilters()"
          (click)="openForm()"
          class="btn btn-primary"
        >
          Create Tag
        </button>
      </div>
    </div>
  `,
})
export class TagsPageComponent implements OnInit {
  store = inject(TagsStore);
  
  showForm = false;
  selectedTag: Tag | null = null;
  searchQuery = '';
  sortBy: 'name' | 'usageCount' | 'createdAt' = 'name';

  ngOnInit() {
    this.store.loadTags();
  }

  openForm() {
    this.showForm = true;
    this.selectedTag = null;
  }

  closeForm() {
    this.showForm = false;
    this.selectedTag = null;
  }

  onSubmit(data: { name: string; color: string }) {
    if (this.selectedTag) {
      this.store.updateTag({ id: this.selectedTag.id, updates: data });
    } else {
      this.store.addTag(data);
    }
    this.closeForm();
  }

  onEdit(tag: Tag) {
    this.selectedTag = tag;
    this.showForm = true;
  }

  onDelete(tag: Tag) {
    if (confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
      this.store.deleteTag(tag.id);
    }
  }

  onTagClick(tag: Tag) {
    this.store.selectTag(tag.id);
  }

  onSearchChange(query: string) {
    this.store.updateFilters({ search: query });
  }

  onSortChange() {
    this.store.updateFilters({ sortBy: this.sortBy });
  }
}
