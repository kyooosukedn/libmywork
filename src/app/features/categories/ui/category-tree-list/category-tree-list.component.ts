import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryTree } from '@core/models';
import { CategoryTreeItemComponent } from '../category-tree-item/category-tree-item.component';

@Component({
  selector: 'app-category-tree-list',
  standalone: true,
  imports: [CommonModule, CategoryTreeItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="categories.length === 0" class="flex flex-col items-center justify-center py-16 px-4">
      <div class="w-24 h-24 mb-6 text-gray-300 dark:text-gray-600">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        No categories yet
      </h3>
      <p class="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-sm">
        Create your first category to start organizing your resources and notes
      </p>
      <button
        (click)="onCreateClick()"
        class="btn btn-primary"
      >
        <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Category
      </button>
    </div>

    <div *ngIf="categories.length > 0" class="card">
      <app-category-tree-item
        *ngFor="let category of categories; trackBy: trackById"
        [category]="category"
        (edited)="categoryEdited.emit($event)"
        (deleted)="categoryDeleted.emit($event)"
      />
    </div>
  `,
})
export class CategoryTreeListComponent {
  @Input() categories: CategoryTree[] = [];

  @Output() categoryEdited = new EventEmitter<string>();
  @Output() categoryDeleted = new EventEmitter<string>();
  @Output() createClicked = new EventEmitter<void>();

  trackById(_index: number, item: CategoryTree): string {
    return item.id;
  }

  onCreateClick(): void {
    this.createClicked.emit();
  }
}
